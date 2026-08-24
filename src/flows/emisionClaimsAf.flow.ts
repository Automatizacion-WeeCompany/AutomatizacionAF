import { expect, Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { InicioSesionClaimsPage } from "../paginas/inicioSesionClaimsPage";
import { HomeClaimsPage } from "../paginas/homeClaimsPage";
import { ListaEmisionesPage } from "../paginas/listaEmisionesClaimsPage";
import { SolicitudClaimsPage } from "../paginas/solicitudClaimsPage";
import {
    ResultadoAceptacionEmisionClaims,
} from "../types/EmisionClaims";
import { DatosCotizacionGuardados } from "../utilidades/ContextoDatosCotizacion";
import { guardarLogEmisionClaims } from "../utilidades/LogEmisionClaims";
import { ComparacionDatosEmisionClaimsFlow } from "./comparacionDatosEmisionClaims.flow";

export function obtenerFechaVigenciaActual(fecha = new Date()) {
    const zonaHoraria = process.env.TZ || "America/Mexico_City";
    const partes = new Intl.DateTimeFormat("es-MX", {
        timeZone: zonaHoraria,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).formatToParts(fecha);
    const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
        partes.find((parte) => parte.type === tipo)?.value ?? "";

    return `${valor("day")}/${valor("month")}/${valor("year")}`;
}

export class InicioSesionEmisionClaimsAfFlow {
    inicioSesionClaimsPage: InicioSesionClaimsPage;
    constructor(private readonly page: Page) {
        this.inicioSesionClaimsPage = new InicioSesionClaimsPage(this.page);
    }

    async inicioSesionEmisionClaimsAf(url: string, correo: string, contrasena: string) {
        await this.page.goto(url);
        await this.inicioSesionClaimsPage.ingresaCorreo(correo);
        await this.inicioSesionClaimsPage.ingresaContrasena(contrasena);
        await this.inicioSesionClaimsPage.clickBtnIniciarSesion();
    }
}

export class EmisionClaimsAfFlow {
    homeClaimsPage: HomeClaimsPage;
    listaEmisionesPage: ListaEmisionesPage;
    solicitudClaimsPage: SolicitudClaimsPage;
    comparacionDatos: ComparacionDatosEmisionClaimsFlow;
    constructor(private readonly page: Page) {
        this.homeClaimsPage = new HomeClaimsPage(this.page);
        this.listaEmisionesPage = new ListaEmisionesPage(this.page);
        this.solicitudClaimsPage = new SolicitudClaimsPage(this.page);
        this.comparacionDatos = new ComparacionDatosEmisionClaimsFlow(this.page);
    }

    private async abrirSolicitud(numeroPoliza: string) {
        await this.homeClaimsPage.clickBtnEmision();
        await this.listaEmisionesPage.BuscarYSeleccionarPoliza(
            numeroPoliza,
        );
        await expect(
            this.page.locator('a[href="#InformacionGeneralEmision"]'),
        ).toBeVisible({ timeout: 30000 });
    }

    private async procesarLimitaciones(
        resultado: ResultadoAceptacionEmisionClaims,
        contrasenaFirma: string,
    ) {
        let asegurados = await this.solicitudClaimsPage.obtenerAseguradosLimitaciones();
        const pendientesIniciales = asegurados.filter(
            ({ estado }) => estado === "PendienteUW",
        );
        if (resultado.pendientesIniciales.length === 0) {
            resultado.pendientesIniciales = pendientesIniciales.map(
                ({ nombre }) => nombre,
            );
        }

        for (const rechazado of asegurados.filter(
            ({ estado }) => estado === "Rechazado",
        )) {
            if (resultado.rechazados.some(({ id }) => id === rechazado.id)) {
                continue;
            }

            const detalle =
                await this.solicitudClaimsPage.obtenerDetalleEstadoAsegurado(
                    rechazado,
                );
            resultado.rechazados.push({
                id: rechazado.id,
                nombre: rechazado.nombre,
                motivo: detalle.detalle,
            });

            if (!/rechaz/i.test(detalle.detalle)) {
                resultado.incidencias.push(
                    `${rechazado.nombre} está marcado como Rechazado, pero su detalle no identifica un motivo de rechazo: ${detalle.detalle}`,
                );
            }
        }

        for (let ciclo = 0; ciclo < 5; ciclo++) {
            const pendientes = asegurados.filter(
                ({ estado }) => estado === "PendienteUW",
            );
            if (pendientes.length === 0) {
                break;
            }

            for (const pendiente of pendientes) {
                const detalle =
                    await this.solicitudClaimsPage.obtenerDetalleEstadoAsegurado(
                        pendiente,
                    );
                const estadoFinal =
                    await this.solicitudClaimsPage.autorizarAsegurado(
                        pendiente,
                        contrasenaFirma,
                    );
                resultado.autorizados.push({
                    id: pendiente.id,
                    nombre: pendiente.nombre,
                    estadoInicial: detalle.textoEstado,
                    motivoEvaluacion: detalle.detalle,
                    estadoFinal,
                });

                if (estadoFinal === "Desconocido") {
                    resultado.incidencias.push(
                        `${pendiente.nombre} dejó de estar Pendiente UW, pero Claims no expuso una clase reconocida de autorización.`,
                    );
                }
            }

            asegurados =
                await this.solicitudClaimsPage.obtenerAseguradosLimitaciones();
        }

        resultado.pendientesFinales = asegurados
            .filter(({ estado }) => estado === "PendienteUW")
            .map(({ nombre }) => nombre);

        if (resultado.pendientesFinales.length > 0) {
            throw new Error(
                `Permanecen asegurados Pendiente UW: ${resultado.pendientesFinales.join(", ")}`,
            );
        }
    }

    private async procesarAceptacion(
        numeroPoliza: string,
        contrasenaFirma: string,
    ) {
        const resultado: ResultadoAceptacionEmisionClaims = {
            idEjecucion: randomUUID(),
            fechaHora: new Date().toISOString(),
            numeroPoliza,
            estado: "Error",
            intentosAceptacion: [],
            pendientesIniciales: [],
            autorizados: [],
            rechazados: [],
            pendientesFinales: [],
            incidencias: [],
        };
        let limitacionesProcesadas = false;

        try {
            for (let paso = 0; paso < 5; paso++) {
                const intento = await this.solicitudClaimsPage.aceptarCotizacion();
                resultado.intentosAceptacion.push(intento);

                if (intento.resultado === "FechaVigenciaRequerida") {
                    const fecha = obtenerFechaVigenciaActual();
                    await this.solicitudClaimsPage.actualizarFechaInicioVigencia(
                        fecha,
                    );
                    resultado.fechaVigenciaAplicada = fecha;
                    continue;
                }

                if (intento.resultado === "AseguradosPendientes") {
                    if (
                        limitacionesProcesadas &&
                        resultado.pendientesFinales.length === 0
                    ) {
                        throw new Error(
                            "Claims mantiene el bloqueo de asegurados pendientes aunque ya no existen registros Pendiente UW visibles.",
                        );
                    }

                    await this.procesarLimitaciones(resultado, contrasenaFirma);
                    limitacionesProcesadas = true;
                    continue;
                }

                resultado.estado = "AceptacionEnviada";
                const rutaLog = await guardarLogEmisionClaims(resultado);
                return { resultado, rutaLog };
            }

            throw new Error(
                "La emisión no avanzó después de cinco intentos controlados de aceptación.",
            );
        } catch (error) {
            resultado.error = error instanceof Error ? error.message : String(error);
            const rutaLog = await guardarLogEmisionClaims(resultado);
            throw new Error(
                `No fue posible continuar la emisión de la póliza ${numeroPoliza}. Consulte ${rutaLog}. Causa: ${resultado.error}`,
            );
        }
    }

    async emisionClaimsAf(
        datosCotizacion: DatosCotizacionGuardados,
        contrasenaFirma: string,
    ) {
        await this.abrirSolicitud(datosCotizacion.numeroPoliza);
        await this.solicitudClaimsPage.ClickBtnAtenderSolicitud();
        const comparacion = await this.comparacionDatos.ejecutar(datosCotizacion);
        const aceptacion = await this.procesarAceptacion(
            datosCotizacion.numeroPoliza,
            contrasenaFirma,
        );
        return { comparacion, aceptacion };
    }
}
