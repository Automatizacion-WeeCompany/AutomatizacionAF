import { expect, Locator, Page } from "@playwright/test";
import {
  AseguradoLimitacionClaims,
  DetalleEstadoAseguradoClaims,
  EstadoLimitacionClaims,
  IntentoAceptacionClaims,
} from "../types/EmisionClaims";

export interface PersonaClaims {
  titulo: string;
  campos: Record<string, string>;
}

export interface CampoDetalleClaims {
  etiqueta: string;
  valor: string;
  documentos: string[];
}

export interface FilaDetalleClaims {
  campos: Record<string, string>;
  documentos: Record<string, string[]>;
}

export interface PersonaDetalleClaims {
  titulo: string;
  campos: CampoDetalleClaims[];
}

export interface RespuestaDetalladaClaims {
  pregunta: string;
  respuesta: "Si" | "No";
  filas: FilaDetalleClaims[];
  personas: PersonaDetalleClaims[];
}

const CAMPOS_SOLICITANTE_PRIMARIO = {
  apellidos: "#PrimarioApellido",
  primerNombre: "#PrimarioPNombre",
  segundoNombre: "#PrimarioSNombre",
  fechaNacimiento: "#PrimarioFechaNacimiento",
  sexoAlNacer: "#PrimarioSNacer",
  paisNacimiento: "#PrimarioPnacimiento",
  estadoCivil: "#PrimarioECivil",
  estatura: "#PrimarioEstatura",
  peso: "#PrimarioPeso",
  telefonoCelular: "#PrimarioNtCelular",
  telefonoSecundario: "#PrimarioNTSecundario",
  correoElectronico: "#PrimarioDCElectronico",
  ocupacion: "#PrimarioOcupacion",
  ciudadania: "#PrimarioCiudadania",
  tipoIdentificacion: "#PrimarioTIdentificacion",
  numeroIdentificacion: "#PrimarioNIdentificacion",
  paisExpedicion: "#PrimarioPaisExpedicion",
  archivoIdentificacion: "#PrimarioCopiaIdentifiacion",
  direccionResidencial: "#PrimarioDireccionNP",
  paisResidencia: "#PrimarioPaisResidenciaNP",
  ciudadResidencial: "#PrimarioCiudadNP",
  estadoResidencial: "#PrimarioEstadoNP",
  codigoPostalResidencial: "#PrimarioCodigoPostalNP",
  direccionCorrespondencia: "#PrimarioDireccionCorrespondencia",
  paisCorrespondencia: "#PrimarioPaisResidenciaCorrespondencia",
  ciudadCorrespondencia: "#PrimarioCiudadCorrespondencia",
  estadoCorrespondencia: "#PrimarioEstadoCorrespondencia",
  codigoPostalCorrespondencia: "#PrimarioCodigoPostalCorrespondencia",
} as const;

const CAMPOS_BENEFICIARIO = {
  apellidos: "#BeneficiarioApellidos",
  primerNombre: "#BeneficiarioPrimerNombre",
  segundoNombre: "#BeneficiarioSegundoNombre",
  fechaNacimiento: "#BeneficiarioFNacimiento",
  telefonoCelular: "#BeneficiarioNTCelular",
  correoElectronico: "#BeneficiarioDCElectronico",
  ciudadania: "#BeneficiarioCiudadania",
  paisResidencia: "#BeneficiarioPResidencia",
} as const;

function obtenerEstadoLimitacion(clases: string[]): EstadoLimitacionClaims {
  if (clases.includes("PendienteUW")) {
    return "PendienteUW";
  }
  if (clases.includes("Rechazado")) {
    return "Rechazado";
  }
  if (
    clases.some((clase) =>
      /^(Autorizado|Autorizada|Aceptado|Aceptada|Aprobado|Aprobada)$/i.test(
        clase,
      ),
    )
  ) {
    return "Autorizado";
  }
  return "Desconocido";
}

export class SolicitudClaimsPage {
  constructor(private readonly page: Page) {}

  private async abrirPestana(href: string) {
    const enlace = this.page.locator(`a[href="${href}"]`).first();
    const panel = this.page.locator(href);

    await expect(enlace).toBeVisible({ timeout: 15000 });
    await enlace.click();
    await expect(panel).toBeVisible({ timeout: 15000 });
  }

  private async texto(locator: Locator) {
    if ((await locator.count()) === 0) {
      return "";
    }
    return (await locator.first().innerText()).trim();
  }

  private async obtenerCamposPorSelector(
    campos: Record<string, string>,
  ): Promise<Record<string, string>> {
    const resultado: Record<string, string> = {};

    for (const [campo, selector] of Object.entries(campos)) {
      resultado[campo] = await this.texto(this.page.locator(selector));
    }

    return resultado;
  }

  private async obtenerRespuestaDetallada(
    selector: string,
  ): Promise<RespuestaDetalladaClaims> {
    const encabezado = this.page.locator(selector);
    await expect(encabezado).toBeAttached();

    return encabezado.evaluate((elemento) => {
      const compactar = (valor: string | null | undefined) =>
        (valor ?? "").replace(/\s+/g, " ").trim();
      const contenedor = elemento.parentElement;
      const cuerpo = elemento.nextElementSibling;
      const filas: FilaDetalleClaims[] = [];

      for (const tabla of Array.from(cuerpo?.querySelectorAll("table") ?? [])) {
        const encabezados = Array.from(tabla.querySelectorAll("thead th")).map(
          (celda) => compactar(celda.textContent),
        );

        for (const fila of Array.from(tabla.querySelectorAll("tbody tr"))) {
          const campos: Record<string, string> = {};
          const documentos: Record<string, string[]> = {};

          Array.from(fila.querySelectorAll("td")).forEach((celda, indice) => {
            const encabezadoTabla = encabezados[indice] || `Columna ${indice + 1}`;
            campos[encabezadoTabla] = compactar(celda.textContent);
            documentos[encabezadoTabla] = Array.from(
              celda.querySelectorAll<HTMLAnchorElement>("a[data-src]"),
            ).map((enlace) => {
              const ruta = enlace.dataset.src ?? "";
              return ruta.split("?")[0].split("/").pop() || "Documento disponible";
            });
          });

          filas.push({ campos, documentos });
        }
      }

      const personas: PersonaDetalleClaims[] = Array.from(
        cuerpo?.querySelectorAll(":scope > .row > ul.collapsible > li") ?? [],
      ).map((persona) => {
        const titulo = compactar(
          persona.querySelector(":scope > .collapsible-header")?.textContent,
        );
        const campos = Array.from(
          persona.querySelectorAll<HTMLLabelElement>(
            ":scope > .collapsible-body label",
          ),
        )
          .map((etiqueta) => {
            const valor = compactar(etiqueta.querySelector("span")?.textContent);
            const textoCompleto = compactar(etiqueta.textContent);
            const nombre =
              valor && textoCompleto.endsWith(valor)
                ? textoCompleto.slice(0, -valor.length)
                : textoCompleto;

            return {
              etiqueta: nombre.replace(/[:\s]+$/, ""),
              valor,
              documentos: Array.from(
                etiqueta.querySelectorAll<HTMLAnchorElement>("a[data-src]"),
              ).map((enlace) => {
                const ruta = enlace.dataset.src ?? "";
                return ruta.split("?")[0].split("/").pop() || "Documento disponible";
              }),
            };
          })
          .filter(({ etiqueta, valor, documentos }) =>
            Boolean(etiqueta || valor || documentos.length),
          );

        return { titulo, campos };
      });

      const sinResultados = Boolean(
        contenedor?.querySelector(".labelTextoSinResultados"),
      );

      return {
        pregunta: compactar(elemento.textContent),
        respuesta:
          !sinResultados && (filas.length > 0 || personas.length > 0)
            ? "Si"
            : "No",
        filas,
        personas,
      };
    });
  }

  async ClickBtnGenerarDocumentacion() {
    await this.page.click("#regeneraDocs");
  }

  async ClickBtnPrepolizaPagada() {
    await this.page.click("#polizaEstatus");
  }

  async ClickBtnAtenderSolicitud() {
    const boton = this.page
      .getByText(/Atender solicitud/i, { exact: true })
      .first();

    await expect(boton).toBeVisible({ timeout: 15000 });
    await boton.click();
    await expect(boton).toBeHidden({ timeout: 15000 });
    await expect(
      this.page.locator('a[href="#InformacionGeneralEmision"]'),
    ).toBeVisible();
  }

  async ClickPestanaInformacionGeneral() {
    await this.abrirPestana("#InformacionGeneralEmision");
  }

  async ClickPestanaCoberturasDeSeguros() {
    await this.abrirPestana("#CoberturasSeguros");
  }

  async ClickPestanaCuestionario() {
    await this.abrirPestana("#Cuestionario");
  }

  async ClickPestanaPlanyFrecuenciaPago() {
    await this.abrirPestana("#PlanPago");
  }

  async ClickPestanaIdioma() {
    await this.abrirPestana("#Idioma");
  }

  async ClickPestanaLimitaciones() {
    await this.abrirPestana("#Exclusiones");
  }

  async ClickPestanaContrato() {
    await this.abrirPestana("#Contrato");
  }

  async obtenerSolicitantePrimario() {
    await this.ClickPestanaInformacionGeneral();
    await expect(this.page.locator("#PrimarioPNombre")).not.toHaveText("");
    return this.obtenerCamposPorSelector(CAMPOS_SOLICITANTE_PRIMARIO);
  }

  async obtenerDependientes(): Promise<PersonaClaims[]> {
    await this.ClickPestanaInformacionGeneral();
    const acordeon = this.page.locator("#InformacionParejaEmision");
    const grupos = this.page.locator("#AcordionInAcordion > li");

    if ((await grupos.locator("span.value").count()) === 0) {
      if (!(await acordeon.isVisible())) {
        return [];
      }
      await acordeon.click({ timeout: 5000 });
      if ((await grupos.locator("span.value").count()) === 0) {
        return [];
      }
    }

    return grupos.evaluateAll((elementos) =>
      elementos
        .map((elemento) => {
          const titulo =
            elemento
              .querySelector(":scope > .collapsible-header")
              ?.textContent?.trim()
              .replace(/\s+/g, " ") ?? "";
          const campos: Record<string, string> = {};

          for (const etiqueta of Array.from(
            elemento.querySelectorAll<HTMLLabelElement>("label"),
          )) {
            const valor = etiqueta.querySelector<HTMLElement>("span.value");
            if (!valor) {
              continue;
            }

            const copia = etiqueta.cloneNode(true) as HTMLElement;
            copia.querySelector("span.value")?.remove();
            const nombreCampo = (copia.textContent ?? "")
              .trim()
              .replace(/\s+/g, " ")
              .replace(/:+$/, "");
            campos[nombreCampo] = valor.textContent?.trim() ?? "";
          }

          return { titulo, campos };
        })
        .filter(({ campos }) => Object.keys(campos).length > 0),
    );
  }

  async obtenerBeneficiario() {
    await this.ClickPestanaInformacionGeneral();
    const campos = await this.obtenerCamposPorSelector(CAMPOS_BENEFICIARIO);
    campos.relacion = await this.texto(this.page.locator("#NombreCompleto"));
    return campos;
  }

  async obtenerRespuestasCoberturas(): Promise<
    Record<string, RespuestaDetalladaClaims>
  > {
    await this.ClickPestanaCoberturasDeSeguros();
    const respuestas: Record<string, RespuestaDetalladaClaims> = {};

    for (let numero = 1; numero <= 6; numero++) {
      respuestas[`Pregunta ${numero}`] = await this.obtenerRespuestaDetallada(
        `#PreguntaCoberturas${numero}`,
      );
    }

    return respuestas;
  }

  async obtenerRespuestasCuestionario(): Promise<
    Record<string, RespuestaDetalladaClaims>
  > {
    await this.ClickPestanaCuestionario();
    await this.page.locator("#CuestinarioSeccion1").click();
    const respuestas: Record<string, RespuestaDetalladaClaims> = {};

    for (let numero = 1; numero <= 18; numero++) {
      const letra = String.fromCharCode(64 + numero);
      respuestas[`Sección I - Pregunta ${letra}`] =
        await this.obtenerRespuestaDetallada(
          `#CuestinarioSeccion1_${letra}`,
        );
    }

    const seccionDos = this.page.locator("#CuestinarioSeccion2");
    if ((await seccionDos.count()) > 0 && (await seccionDos.isVisible())) {
      await seccionDos.click();
      await expect(this.page.locator("#CuestinarioSeccion2_A")).toBeAttached();

      for (const letra of ["A", "B", "C"]) {
        respuestas[`Sección II - Pregunta ${letra}`] =
          await this.obtenerRespuestaDetallada(
            `#CuestinarioSeccion2_${letra}`,
          );
      }
    }

    return respuestas;
  }

  async obtenerPlanYFrecuencia() {
    await this.ClickPestanaPlanyFrecuenciaPago();
    return {
      plan: await this.texto(this.page.locator("#PlanFP")),
      redProveedores: await this.texto(
        this.page.locator("#RedProvedoresFP"),
      ),
      deducible: await this.texto(this.page.locator("#DeducibleFP")),
      frecuenciaPago: await this.texto(
        this.page.locator("#FrecuenciaPagoFP"),
      ),
    };
  }

  async obtenerIdioma() {
    await this.ClickPestanaIdioma();
    return this.texto(this.page.locator("#TextIdiomaSeleccionado"));
  }

  async obtenerSolicitantesLimitaciones() {
    await this.ClickPestanaLimitaciones();
    const solicitantes = this.page.locator("#Exclusiones a");
    await expect(solicitantes.first()).toBeVisible({ timeout: 15000 });
    return solicitantes
      .evaluateAll((elementos) =>
        elementos
          .map((elemento) =>
            (elemento.textContent ?? "").trim().replace(/\s+/g, " "),
          )
          .filter((texto) => /\(.+\)/.test(texto)),
      );
  }

  async obtenerDocumentosContrato() {
    await this.ClickPestanaContrato();
    const documentos = this.page.locator("#Contrato a[id]");
    await expect(documentos.first()).toBeVisible({ timeout: 15000 });
    return documentos
      .evaluateAll((elementos) =>
        elementos
          .map((elemento) =>
            (elemento.textContent ?? "").trim().replace(/\s+/g, " "),
          )
          .filter(Boolean),
      );
  }

  async aceptarCotizacion(): Promise<IntentoAceptacionClaims> {
    const boton = this.page.locator(".SMaccionAceptarCotizacion").first();
    const mensajesBloqueo = this.page
      .locator(".amaran")
      .filter({
        hasText:
          /Captura Fecha de Vigencia|Tienes asegurados pendientes por autorizar/i,
      });

    await mensajesBloqueo
      .last()
      .waitFor({ state: "hidden", timeout: 5000 })
      .catch(() => undefined);
    await expect(boton).toBeVisible({ timeout: 15000 });

    const urlAnterior = this.page.url();
    await boton.click();

    for (let intento = 0; intento < 40; intento++) {
      const modalFirmaSolicitud = this.page
        .locator("#modalWeeMedic_NoneEscSmall")
        .filter({ hasText: /Aceptar solicitud/i });
      if (
        (await modalFirmaSolicitud.count()) > 0 &&
        (await modalFirmaSolicitud.isVisible())
      ) {
        return {
          resultado: "AceptacionEnviada",
          mensaje:
            "Claims abrió la firma final de Aceptar solicitud; el flujo se detiene antes de confirmarla",
        };
      }

      const mensajes = (await this.page
        .locator(".amaran:visible")
        .allTextContents())
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (/Captura Fecha de Vigencia/i.test(mensajes)) {
        return {
          resultado: "FechaVigenciaRequerida",
          mensaje: "Captura Fecha de Vigencia",
        };
      }
      if (/Tienes asegurados pendientes por autorizar/i.test(mensajes)) {
        return {
          resultado: "AseguradosPendientes",
          mensaje: "Tienes asegurados pendientes por autorizar",
        };
      }

      if (
        this.page.url() !== urlAnterior ||
        !(await boton.isVisible().catch(() => false))
      ) {
        return {
          resultado: "AceptacionEnviada",
          mensaje: mensajes || "Claims avanzó después de aceptar la cotización",
        };
      }

      await this.page.waitForTimeout(200);
    }

    const mensaje = (await this.page
      .locator(".amaran:visible")
      .allTextContents())
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      resultado: "AceptacionEnviada",
      mensaje: mensaje || "No se mostró un bloqueo después de aceptar",
    };
  }

  async actualizarFechaInicioVigencia(fecha: string) {
    await this.ClickPestanaPlanyFrecuenciaPago();
    const campo = this.page.locator("#FechaInicioVigencia");

    await expect(campo).toBeVisible({ timeout: 15000 });
    await campo.fill(fecha);
    await campo.press("Tab");
    await expect(campo).toHaveValue(fecha);
  }

  async obtenerAseguradosLimitaciones(): Promise<
    AseguradoLimitacionClaims[]
  > {
    await this.ClickPestanaLimitaciones();
    const asegurados = this.page.locator(
      "#Exclusiones a.infoExclusionAfiliado",
    );

    await expect(asegurados.first()).toBeVisible({ timeout: 15000 });
    const elementos = await asegurados.evaluateAll((enlaces) =>
      enlaces
        .filter((enlace) => {
          const estilo = window.getComputedStyle(enlace);
          const rectangulo = enlace.getBoundingClientRect();
          return (
            estilo.display !== "none" &&
            estilo.visibility !== "hidden" &&
            rectangulo.width > 0 &&
            rectangulo.height > 0
          );
        })
        .map((enlace) => ({
          id: enlace.id,
          nombre: (enlace.textContent ?? "").replace(/\s+/g, " ").trim(),
          clases: Array.from(enlace.classList),
        })),
    );

    return elementos.map((elemento) => ({
      ...elemento,
      estado: obtenerEstadoLimitacion(elemento.clases),
    }));
  }

  async obtenerDetalleEstadoAsegurado(
    asegurado: AseguradoLimitacionClaims,
  ): Promise<DetalleEstadoAseguradoClaims> {
    const enlace = this.page.locator(
      `#Exclusiones a.infoExclusionAfiliado[id="${asegurado.id}"]`,
    );
    await expect(enlace).toBeVisible({ timeout: 15000 });
    await enlace.click();

    const estado = this.page.locator("#divStatus");
    await expect(estado).toBeVisible({ timeout: 15000 });
    await expect(estado).not.toHaveText(/^\s*$/);
    const textoEstado = (await estado.innerText()).replace(/\s+/g, " ").trim();

    await estado.click();
    const modal = this.page.locator("#modalWeeMedic_NoneEsc");
    await expect(modal).toBeVisible({ timeout: 15000 });
    const contenedorDetalle = modal.locator("#rechazoContainer");
    await expect(contenedorDetalle).toBeVisible();
    await expect(contenedorDetalle).not.toHaveText(/^\s*$/);
    const detalle = (await contenedorDetalle.innerText())
      .replace(/\s+/g, " ")
      .trim();

    await modal.getByRole("button", { name: "Cerrar", exact: true }).click();
    await expect(modal).toBeHidden();

    return {
      ...asegurado,
      textoEstado,
      detalle,
    };
  }

  async autorizarAsegurado(
    asegurado: AseguradoLimitacionClaims,
    contrasenaFirma: string,
  ): Promise<EstadoLimitacionClaims> {
    const enlace = this.page.locator(
      `#Exclusiones a.infoExclusionAfiliado[id="${asegurado.id}"]`,
    );
    await expect(enlace).toBeVisible({ timeout: 15000 });
    const modal = this.page.locator("#modalWeeMedic_NoneEscSmall");

    for (let intento = 1; intento <= 2; intento++) {
      await enlace.click();

      const botonAutorizar = this.page.locator("#autorizarAsegurado");
      await expect(botonAutorizar).toBeVisible({ timeout: 15000 });
      await botonAutorizar.click();

      await expect(modal).toBeVisible({ timeout: 15000 });
      await modal.locator("#txtSolicitudFirma").fill(contrasenaFirma);
      await modal.locator("#ContinuarAsegurado").click();

      const modalCerrado = await modal
        .waitFor({ state: "hidden", timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (modalCerrado) {
        await expect(enlace).not.toHaveClass(/PendienteUW/, {
          timeout: 15000,
        });
        const clases = ((await enlace.getAttribute("class")) ?? "")
          .split(/\s+/)
          .filter(Boolean);
        return obtenerEstadoLimitacion(clases);
      }

      const mensajes = (await this.page
        .locator(".amaran:visible")
        .allTextContents())
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (intento === 2) {
        throw new Error(
          `No se pudo autorizar a ${asegurado.nombre}. ${mensajes || "El modal de firma permaneció abierto después de dos intentos"}`,
        );
      }

      const cancelar = modal.getByRole("button", {
        name: "Cancelar",
        exact: true,
      });
      await cancelar.click();
      await expect(modal).toBeHidden();
      await this.page.waitForTimeout(1500);
    }

    throw new Error(`No se pudo autorizar a ${asegurado.nombre}`);
  }
}
