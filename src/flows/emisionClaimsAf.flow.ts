import { Page } from "@playwright/test";
import { InicioSesionClaimsPage } from "../paginas/inicioSesionClaimsPage";
import { HomeClaimsPage } from "../paginas/homeClaimsPage";
import { ListaEmisionesPage } from "../paginas/listaEmisionesClaimsPage";
import { SolicitudClaimsPage } from "../paginas/solicitudClaimsPage";


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
    constructor(private readonly page: Page) {
        this.homeClaimsPage = new HomeClaimsPage(this.page);
        this.listaEmisionesPage = new ListaEmisionesPage(this.page);
        this.solicitudClaimsPage = new SolicitudClaimsPage(this.page);
    }

    async emisionClaimsAf(Folio: string) {
        await this.homeClaimsPage.clickBtnEmision();
        await this.listaEmisionesPage.SeleccionaLaCotizacion(Folio);
        await this.solicitudClaimsPage.ClickPestanaInformacionGeneral();
        //Valida la informacion del solicitante primario
        const Apellidos = await this.page.locator('#PrimarioApellido').textContent();
        const PrimerNombre = await this.page.locator('#PrimarioPNombre').textContent();
        const FechaNacimiento = await this.page.locator('#PrimarioFechaNacimiento').textContent();
        const SexoAlNacer = await this.page.locator('#PrimarioSNacer').textContent();
        const PaisNacimiento = await this.page.locator('#PrimarioPnacimiento').textContent();
        const EstadoCivil = await this.page.locator('#PrimarioECivil').textContent();
        const Estatura = await this.page.locator('#PrimarioEstatura').textContent();
        const Peso = await this.page.locator('#PrimarioPeso').textContent();
        const TelefonoCelular = await this.page.locator('#PrimarioNtCelular').textContent();
        const TelefonoSecuandario = await this.page.locator('#PrimarioNTSecundario').textContent();
        const CorreoElectronico = await this.page.locator('#PrimarioDCElectronico').textContent();
        const Ocupacion = await this.page.locator('#PrimarioOcupacion').textContent();
        const Ciudadania = await this.page.locator('#PrimarioCiudadania').textContent();
        const TipoIdentificacion = await this.page.locator('#PrimarioTIdentificacion').textContent();
        const NumeroIdentificacion = await this.page.locator('#PrimarioNIdentificacion').textContent();
        const PaisExpedicionID = await this.page.locator('#PrimarioPaisExpedicion').textContent();
        console.log('datos' + Apellidos, PrimerNombre, FechaNacimiento, SexoAlNacer, PaisNacimiento, EstadoCivil,
            Estatura, Peso, TelefonoCelular, TelefonoSecuandario, CorreoElectronico, Ocupacion, Ciudadania,
            TipoIdentificacion, NumeroIdentificacion, PaisExpedicionID);
        await this.solicitudClaimsPage.ClickPestanaCoberturasDeSeguros();
        await this.solicitudClaimsPage.ClickPestanaCuestioanrio();
        await this.solicitudClaimsPage.ClickPestanaPlanyFrecuenciaPago();
        await this.solicitudClaimsPage.ClickPestanaIdioma();
        await this.solicitudClaimsPage.ClickPestanaLimitaciones();
        await this.solicitudClaimsPage.ClickPestanaContrato();
    }
}