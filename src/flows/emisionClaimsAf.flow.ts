import { expect, Page } from "@playwright/test";
import { InicioSesionClaimsPage } from "../paginas/inicioSesionClaimsPage";
import { HomeClaimsPage } from "../paginas/homeClaimsPage";
import { ListaEmisionesPage } from "../paginas/listaEmisionesClaimsPage";
import { SolicitudClaimsPage } from "../paginas/solicitudClaimsPage";
import { DatosCotizacionGuardados } from "../utilidades/ContextoDatosCotizacion";
import { ComparacionDatosEmisionClaimsFlow } from "./comparacionDatosEmisionClaims.flow";


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

    async emisionClaimsAf(datosCotizacion: DatosCotizacionGuardados) {
        await this.homeClaimsPage.clickBtnEmision();
        await this.listaEmisionesPage.BuscarYSeleccionarPoliza(
            datosCotizacion.numeroPoliza,
        );
        await expect(
            this.page.locator('a[href="#InformacionGeneralEmision"]'),
        ).toBeVisible({ timeout: 30000 });
        await this.solicitudClaimsPage.ClickBtnAtenderSolicitud();
        return this.comparacionDatos.ejecutar(datosCotizacion);
    }
}
