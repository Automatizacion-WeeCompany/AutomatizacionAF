import { Page, expect } from "@playwright/test";
import { InicioSesionAFPage } from "../paginas/inicioSesionAFPage";
import { HomeAFPage } from "../paginas/homeAFPage";
import { CotizacionesPropuestasAFPage } from "../paginas/1cotizacionesPropuestasAFPage";
import { InicioCotizacionDatosPersonalesAFPage } from "../paginas/2inicioCotizacionDatosPersonalesAFPage";
import { SeleccionarPlanesAFPage } from "../paginas/3seleccionPlanesAFPage";
import { ResumenCotizacionPage } from "../paginas/4resumenCotizacionPage";
import { ResumenPlanesCotizadosPage } from "../paginas/5resumenCotizacionPage";
import { InformacionPersonalPage } from "../paginas/6informacionPersonalPage";
import { CuestionarioMedicoPt1Page } from "../paginas/7cuestionarioMedicoPt1Page";
import { ValidarTextos } from "src/utilidades/ValidarTextosPagina";
import { GeneradorDatos } from "src/utilidades/GeneradorDatos";
import { validarPantallaPorIdioma, Idioma } from "src/utilidades/validacionIdiomas";
import { EscenarioExcel } from '../types/EscenarioExcel';
import { CuestionarioMedicoPt2Page } from "@pages/8cuestionarioMedicoPt2Page";
import { ConfirmacionDePlanYPagoPage } from "../paginas/9confirmacionDePlanyPagoPage";
import { TerminosyCondicionesPage } from "@pages/10terminosyCondicionesPage";
import { DeclaracionPage } from "@pages/11declaracionPage";

export class InicioSesionAFFlow {
    inicioSesionAFPage: InicioSesionAFPage;

    constructor(private readonly page: Page) {
        this.inicioSesionAFPage = new InicioSesionAFPage(this.page);
    }

    async paginaInicio(Liga: string) {
        await this.page.goto(Liga);
    }

    async iniciarSesionAF(IdiomaCotizacion: string, CorreoInicio: string, Contrasena: string) {
        if (IdiomaCotizacion === 'Esp') {
            await this.inicioSesionAFPage.clickBtnCambioIdioma();
            await this.page.locator('a.dropdown-item-lang', { hasText: 'ESP' }).click();
            const validacionTexto = 'Bienvenido';
            await expect(this.page.locator(`text=${validacionTexto}`)).toBeVisible();
            console.log(`Idioma cambiado correctamente, texto visible: ${validacionTexto}`);
            console.log('Entrando en validacion de textos')
            const resultadoP = await ValidarTextos.validarTextosEsperados({ context: this.page, jsonPath: './src/textosEsperados/TextosEsperadosInicioSesionEsp.json' });
            if (resultadoP.estado !== 'Éxito') {
                GeneradorDatos.guardarResultadoJSON(resultadoP, './src/textosEsperados/textosFaltantes', 'TextosFaltantesInicioSesionEsp');
            }
        }
        else if (IdiomaCotizacion === 'Eng') {
            await this.inicioSesionAFPage.clickBtnCambioIdioma();
            await this.page.locator('a.dropdown-item-lang', { hasText: 'ENG' }).click();
            const validacionTexto = 'Welcome';
            await expect(this.page.locator(`text=${validacionTexto}`)).toBeVisible();
            console.log(`Idioma cambiado correctamente, texto visible: ${validacionTexto}`);
        }
        else if (IdiomaCotizacion === 'Port') {
            await this.inicioSesionAFPage.clickBtnCambioIdioma();
            await this.page.locator('a.dropdown-item-lang', { hasText: 'PORT' }).click();
            const validacionTexto = 'Bem-vindo';
            await expect(this.page.locator(`text=${validacionTexto}`)).toBeVisible();
            console.log(`Idioma cambiado correctamente, texto visible: ${validacionTexto}`);

        }
        else {
            throw new Error('Idioma no soportado revisar archivo de datos');
        }
        await this.inicioSesionAFPage.ingresaCorreo(CorreoInicio);
        await this.inicioSesionAFPage.ingresaContrasena(Contrasena);
        await this.inicioSesionAFPage.clickBtnIniciarSesion();
        await expect(this.page).toHaveURL('https://weeqp.azurewebsites.net/AF/Broker/Home');

    }
}

export class HomeAFFlow {
    homeAFPage: HomeAFPage;

    constructor(private readonly page: Page) {
        this.homeAFPage = new HomeAFPage(this.page);
    }

    async homeAF(IdiomaCotizacion: string) {
        const page = this.page;
        await this.homeAFPage.clickBtnCotizacion();
        if (IdiomaCotizacion === 'Esp') {
            console.log('Validando textos en pantalla de cotizaciones');
            const resultadoP = await ValidarTextos.validarTextosEsperados({ context: page, jsonPath: './src/textosEsperados/TextosEsperadosCotizacionesEsp.json' });
            if (resultadoP.estado !== 'Éxito') {
                GeneradorDatos.guardarResultadoJSON(resultadoP, './src/textosEsperados/textosFaltantes', 'TextosFaltantesCotizacionesEsp');
            }
        }
        // else if (IdiomaCotizacion === 'Eng') {
        //     const resultadoP = await ValidarTextos.validarTextosEsperados({ context: page, jsonPath: './textosEsperados/textosEsperadospantallaBroker.json' });
        //     if (resultadoP.estado !== 'Éxito') {
        //         GeneradorDatos.guardarResultadoJSON(resultadoP, './textosEsperados/textosFaltantes', 'TextosFaltantesPropuestaDeCotizacion');
        //     }
        // }
        // else if (IdiomaCotizacion === 'Port') {
        //     const resultadoP = await ValidarTextos.validarTextosEsperados({ context: page, jsonPath: './textosEsperados/textosEsperadospantallaBroker.json' });
        //     if (resultadoP.estado !== 'Éxito') {
        //         GeneradorDatos.guardarResultadoJSON(resultadoP, './textosEsperados/textosFaltantes', 'TextosFaltantesPropuestaDeCotizacion');
        //     }
        // }
        // else {
        //     throw new Error('Idioma no soportado revisar archivo de datos');
        // }
    }
}

export class IniciarCotizacionFlow {
    iniciarCotizacionPage: CotizacionesPropuestasAFPage;

    constructor(private readonly page: Page) {
        this.iniciarCotizacionPage = new CotizacionesPropuestasAFPage(this.page);
    }

    async iniciarCotizacion(IdiomaCotizacion: string) {
        await this.iniciarCotizacionPage.clickBtnNuevaCotizacion();
        await validarPantallaPorIdioma({ page: this.page, pantalla: 'PropuestaCotizacion', idioma: IdiomaCotizacion as Idioma });
    }
}

export class PasoUnoDatosPersonalesFlow {
    CapturaDatosPersonalesPage: InicioCotizacionDatosPersonalesAFPage;
    constructor(private readonly page: Page) {
        this.CapturaDatosPersonalesPage = new InicioCotizacionDatosPersonalesAFPage(this.page);
    }
    async CapturaDatosPersonales(TipoPoliza: string, ConyugePareja: string, HijosMenoresDe24: string) {
        await this.CapturaDatosPersonalesPage.ingresaNombretitular();
        await this.CapturaDatosPersonalesPage.ingresaApellidoTitular();
        await this.CapturaDatosPersonalesPage.ingresaEdadTitular();
        await this.CapturaDatosPersonalesPage.seleccionaPaisRecidenciaTitular();
        if (TipoPoliza === 'Familiar') {
            await this.CapturaDatosPersonalesPage.seleccionaTipoPolizaFamiliar();
            if (ConyugePareja === 'Si') {
                await this.CapturaDatosPersonalesPage.checkConyugeParejaSi();
            }
            if (ConyugePareja === 'No') {
                await this.CapturaDatosPersonalesPage.checkConyugeParejaNo();
            }
            await this.CapturaDatosPersonalesPage.ingresaEdadDependiente();
            await this.CapturaDatosPersonalesPage.seleccionaNumeroHijosMenoresDe24(HijosMenoresDe24);
        }
        await this.CapturaDatosPersonalesPage.clickBtnContinuar();
    }
}

export class PasoDosPlanesFlow {
    seleccionarPlanesPage: SeleccionarPlanesAFPage;
    constructor(private readonly page: Page) {
        this.seleccionarPlanesPage = new SeleccionarPlanesAFPage(this.page);
    }
    async seleccionarPlanes(IdiomaCotizacion: string, CotizarPlan: string, RedProveedores: string, Deducible: string, FrecuenciaPago: string) {
        await validarPantallaPorIdioma({ page: this.page, pantalla: 'SeleccionarPlanes', idioma: IdiomaCotizacion as Idioma });
        switch (CotizarPlan) {
            case 'Superior':
                await this.seleccionarPlanesPage.seleccionarPlanSuperior();
                break;
            case 'Optima':
                await this.seleccionarPlanesPage.seleccionarPlanOptima();
                break;
            case 'Vital':
                await this.seleccionarPlanesPage.seleccionarPlanVital();
                break;
            default:
                throw new Error('Plan no soportado revisar archivo de datos');
        }
        if (RedProveedores === 'Ultra') {
            console.log('Entrando en ultra');
            await this.seleccionarPlanesPage.seleccionaRedProveedoresUltra();
        }
        else if (RedProveedores === 'Plus') {
            await this.seleccionarPlanesPage.seleccionaRedProveedoresPlus();
        }
        else {
            throw new Error('Red de proveedores no soportada revisar archivo de datos');
        }
        await this.seleccionarPlanesPage.seleccionaDeducible(Deducible);
        switch (FrecuenciaPago) {
            case 'Mensual':
                await this.seleccionarPlanesPage.seleccionaFrecuanciaPagoMensual();
                break;
            case 'Trimestral':
                await this.seleccionarPlanesPage.seleccionaFrecuanciaTrimestral();
                break;
            case 'Semestral':
                await this.seleccionarPlanesPage.seleccionaFrecuanciaSemestral();
                break;
            case 'Anual':
                await this.seleccionarPlanesPage.seleccionaFrecuanciaAnual();
                break;
            default:
                throw new Error('Frecuencia de pago no soportada revisar archivo de datos');
        }
        await this.seleccionarPlanesPage.clickBtnContinuar();
    }
}

export class PasoTresCotizacionFlow {
    resumenCotizacionPage: ResumenCotizacionPage;
    constructor(private readonly page: Page) {
        this.resumenCotizacionPage = new ResumenCotizacionPage(this.page);
    }

    async resumenCotizacion(IdiomaCotizacion: string) {
        await validarPantallaPorIdioma({ page: this.page, pantalla: 'ResumenCotizacion', idioma: IdiomaCotizacion as Idioma });
        await this.resumenCotizacionPage.ClickBtnContinuar();
    }

}

export class PasoCuatroResumenCotizacionFlow {
    resumenPlanesCotizadosPage: ResumenPlanesCotizadosPage;
    constructor(private readonly page: Page) {
        this.resumenPlanesCotizadosPage = new ResumenPlanesCotizadosPage(this.page);
    }

    async resumenPlanesCot(IdiomaCotizacion: string) {
        await validarPantallaPorIdioma({ page: this.page, pantalla: 'ResumenPlanesCotizados', idioma: IdiomaCotizacion as Idioma });
        await this.resumenPlanesCotizadosPage.ClickBtnAplicarAhora();
        await validarPantallaPorIdioma({ page: this.page, pantalla: 'ResumenPlanesCotizadosModal', idioma: IdiomaCotizacion as Idioma });
        await this.resumenPlanesCotizadosPage.ClickBtnContestarFormularioAhoraModal();
    }
}

export class PasoCincoInformacionPersonalFlow {
    informacionPersonalPage: InformacionPersonalPage;
    constructor(private readonly page: Page) {
        this.informacionPersonalPage = new InformacionPersonalPage(this.page);
    }

    async informacionPersonal(escenario: EscenarioExcel) {
        const {
            IdiomaCotizacion,
            SexoAlNacer,
            EstadoCivil,
            TelefonoSecundario,
            EliminarTelSec,
            OcupacionTitular,
            TipoIdentificacionTitular,
            DireccionCorrespondencia,
            EliminarDirCorr,
            Hijo1,
            Hijo2,
            Hijo3,
            Hijo4,
            Hijo5,
            SexoDependiente1,
            SexoDependiente2,
            SexoDependiente3,
            SexoDependiente4,
            SexoDependiente5,
            RelacionSolicitantePrimario
        } = escenario;
        await validarPantallaPorIdioma({ page: this.page, pantalla: 'InformacionPersonal', idioma: IdiomaCotizacion as Idioma });
        await this.informacionPersonalPage.IngresaSegundoNombre();
        await this.informacionPersonalPage.IngresaFechaNacimiento();
        switch (SexoAlNacer) {
            case 'Masculino':
                await this.informacionPersonalPage.CheckSexoMasculino();
                break;
            case 'Femenino':
                await this.informacionPersonalPage.CheckSexoFemenino();
                break;
            default:
                throw new Error('Sexo al nacer no soportado revisar archivo de datos');
        }
        await this.informacionPersonalPage.SeleccionaPaisNacimiento();
        if (EstadoCivil === 'Casado(a)') {
            await this.informacionPersonalPage.CheckCasado();
        }
        if (EstadoCivil === 'Soltero(a)') {
            await this.informacionPersonalPage.CheckSoltero();
        }
        else {
            throw new Error('Estado civil no soportado revisar archivo de datos');
        }
        await this.informacionPersonalPage.IngresaEstatura();
        await this.informacionPersonalPage.IngresaPeso();
        await this.informacionPersonalPage.SeleccionaPaisTelefono();
        await this.informacionPersonalPage.IngresaNumeroCelular();
        if (TelefonoSecundario === 'Si') {
            await this.informacionPersonalPage.ClickBtnTelefonoSecundario();
            await this.informacionPersonalPage.IngresaNumeroCelularSecundario();
        }
        if (EliminarTelSec === 'Si') {
            await this.informacionPersonalPage.ClickBtonBasuraTelefonoSecundario();
        }
        await this.informacionPersonalPage.IngresaCorreoTitular();
        await this.informacionPersonalPage.SeleccionaOcupacionTitular(OcupacionTitular);
        await this.informacionPersonalPage.SeleccionaPaisCiudadaniaTitular();
        await this.informacionPersonalPage.SeleccionaTipoIdentificacionTitular(TipoIdentificacionTitular);
        await this.informacionPersonalPage.IngresaNumeroIdentificacionTitular();
        await this.informacionPersonalPage.SeleccionaPaisExpedicionIdTitular();
        await this.informacionPersonalPage.AdjuntaArchivoIdTitular();
        await this.informacionPersonalPage.IngresaDireccionResidencial();
        await this.informacionPersonalPage.IngresaCiudadResidencial();
        await this.informacionPersonalPage.SeleccionaEstadoResidencial();
        await this.informacionPersonalPage.IngresaCodigoPostalResidencial();
        if (DireccionCorrespondencia === 'Si') {
            await this.informacionPersonalPage.ClickBtnAgregarDireccionDeCorrespondencia();
            await this.informacionPersonalPage.IngresaDireccionDeCorrespondencia();
            await this.informacionPersonalPage.SeleccionaPaisDeCorrespondencia();
            await this.informacionPersonalPage.IngresaCiudadDeCorrespondencia();
            await this.informacionPersonalPage.SeleccionaEstadoDeCorrespondencia();
            await this.informacionPersonalPage.IngresaCodigoPostalDeCorrespondencia();
        }
        if (EliminarDirCorr === 'Si') {
            await this.informacionPersonalPage.ClickBtnEliminarDireccionDeCorrespondencia();
        }
        //Agreaga y valida la informacion de los beneficiarios y conyuge
        const hijos = [Hijo1, Hijo2, Hijo3, Hijo4, Hijo5].filter(Boolean);
        const sexos = [SexoDependiente1, SexoDependiente2, SexoDependiente3, SexoDependiente4, SexoDependiente5].filter(Boolean);
        await this.procesarBeneficiarios(hijos, sexos);
        //Agrega y valdia informacion del beneficiario
        await this.informacionPersonalPage.ClickBtnAgregarInfoBeneficiario();
        await this.informacionPersonalPage.SeleccionaRelacionSolicitantePrimario(RelacionSolicitantePrimario);
        await this.informacionPersonalPage.IngresaApellidoBeneficiario();
        await this.informacionPersonalPage.IngresaNombreBeneficiario();
        await this.informacionPersonalPage.IngresaFechaNacimientoBeneficiario();
        await this.informacionPersonalPage.SeleccionaPaisRecidenciaBeneficiario();
        await this.informacionPersonalPage.SeleccionaCiudadaniaBeneficiario();
        await this.informacionPersonalPage.IngresaTelefonoBeneficiario();
        await this.informacionPersonalPage.IngresaCorreoBeneficiario();
        await this.informacionPersonalPage.ClickBtnAgregarBeneficiario();
        await this.informacionPersonalPage.ClickBtnSiguiente();
    }


    private async procesarBeneficiarios(hijos: string[], sexos: string[]) {
        const hijosValidos = new Set(['Hijo Biológico', 'Hijastro', 'Hijo Adoptado Legalmente', 'Menor Bajo Custodia Legal']);
        const sexosValidos = new Set(['Masculino', 'Femenino']);

        for (let i = 0; i < hijos.length; i++) {
            const hijo = hijos[i];
            const sexo = sexos[i]; // alineado con el hijo

            if (!hijosValidos.has(hijo)) {
                throw new Error(`Beneficiario no soportado: ${hijo}`);
            }

            await this.informacionPersonalPage.ClickBtnAgregarHijo();

            switch (hijo) {
                case 'Hijo Biológico':
                    await this.informacionPersonalPage.ClickCheckHijoBiologico();
                    break;
                case 'Hijastro':
                    await this.informacionPersonalPage.ClickCheckHijastro();
                    break;
                case 'Hijo Adoptado Legalmente':
                    await this.informacionPersonalPage.ClickCheckHijoAdoptadoLegalmente();
                    break;
                case 'Menor Bajo Custodia Legal':
                    await this.informacionPersonalPage.ClickCheckMenorBajoCustodiaLegal();
                    break;
            }

            await this.informacionPersonalPage.IngresaApellidoDependiente();
            await this.informacionPersonalPage.IngresaNombreDependiente();
            await this.informacionPersonalPage.IngresaFechaNacimientoDependiente();
            if (!sexo || !sexosValidos.has(sexo)) {
                throw new Error(`Sexo al nacer no soportado o faltante para el dependiente #${i + 1}: ${sexo}`);
            }

            switch (sexo) {
                case 'Masculino':
                    await this.informacionPersonalPage.ClickCheckSexoNacerDependienteMasculino();
                    break;
                case 'Femenino':
                    await this.informacionPersonalPage.ClickCheckSexoNacerDependienteFemenino();
                    break;
            }
            await this.informacionPersonalPage.SeleccionaPaisNacimientoDependiente();
            await this.informacionPersonalPage.IngresaEstaturaDependiente();
            await this.informacionPersonalPage.IngresaPesoDependiente();
            await this.informacionPersonalPage.SeleccionaCiudadaniaDependiente();
            await this.informacionPersonalPage.ClickBtnGuardarHijo();
        }
    }
}

export class PasoSeisCuestionarioMedicoFlow {
    private readonly cuestionarioMedicoPt1Page: CuestionarioMedicoPt1Page;
    constructor(page: Page) {
        this.cuestionarioMedicoPt1Page = new CuestionarioMedicoPt1Page(page);
    }

    async CapturarCuestionarioMedicoP1(IdiomaCotizacion: string, CapturaCuestionarioMedico: string, P5Sustancia: string, SigueIngiriendo: string) {
        if (CapturaCuestionarioMedico === 'No') {
            await this.cuestionarioMedicoPt1Page.CheckNoP1();
            await this.cuestionarioMedicoPt1Page.CheckNoP2();
            await this.cuestionarioMedicoPt1Page.CheckNoP3();
            await this.cuestionarioMedicoPt1Page.CheckNoP4();
            await this.cuestionarioMedicoPt1Page.CheckNoP5();
            await this.cuestionarioMedicoPt1Page.CheckNoP6();
        }
        if (CapturaCuestionarioMedico === 'Si') {
            //Agrega persona pregunta 1
            await this.cuestionarioMedicoPt1Page.CheckSiP1();
            await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP1();
            await this.cuestionarioMedicoPt1Page.SeleccionaPersonaAfectadaP1();
            await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP1();
            //Agrega persona pregunta 2
            await this.cuestionarioMedicoPt1Page.CheckSiP2();
            await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAleatoriaP2();
            await this.cuestionarioMedicoPt1Page.ClickBtnGuardarP2();
            //Agrega persona pregunta 3
            await this.cuestionarioMedicoPt1Page.CheckSiP3();
            await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAleatoriaP3();
            await this.cuestionarioMedicoPt1Page.IngresarDetallesP3();
            await this.cuestionarioMedicoPt1Page.ClickBtnGuardarP3();
            //Agrega persona pregunta 4
            await this.cuestionarioMedicoPt1Page.CheckSiP4();
            await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP4();
            await this.cuestionarioMedicoPt1Page.IngresarDetallesP4();
            await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP4();
            //Agregar persona pregunta 5
            await this.cuestionarioMedicoPt1Page.CheckSiP5();
            await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP5();
            await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAfectadaP5();
            await this.cuestionarioMedicoPt1Page.IngresarDetallesP5();
            await this.cuestionarioMedicoPt1Page.SeleccionarsustanciaP5(P5Sustancia);
            if (SigueIngiriendo === 'Si') {
                await this.cuestionarioMedicoPt1Page.checkIngiriendoSi();
            }
            else {
                await this.cuestionarioMedicoPt1Page.checkIngiriendoNo();
            }
            await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP5();
            //Agregar persona pregunta 6
            await this.cuestionarioMedicoPt1Page.CheckSiP6();
            await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAleatoriaP6();
            await this.cuestionarioMedicoPt1Page.ClickbtnAgregarEspecialistaP6();
            await this.cuestionarioMedicoPt1Page.IngresarNombreMedicoTratante();
            await this.cuestionarioMedicoPt1Page.IngresaNumeroTelefonoMedicoTratante();
            await this.cuestionarioMedicoPt1Page.SeleccionarEspecialidadMedicoTratante();
            await this.cuestionarioMedicoPt1Page.IngresaMotivoConsultaMedicoTratante();
            await this.cuestionarioMedicoPt1Page.IngresaFechaConsultaMedicoTratante();
            await this.cuestionarioMedicoPt1Page.IngresaDescripcionMedicoTratante();
            await this.cuestionarioMedicoPt1Page.ClickBtnGuardarMedicoTratante();
        }
        await this.cuestionarioMedicoPt1Page.ClickBtnSiguiente();

    }
}

export class PasoSieteCuestionarioMedicoFlow {
    private readonly cuestionarioMedicoPt2Page: CuestionarioMedicoPt2Page;
    constructor(private readonly page: Page) {
        this.cuestionarioMedicoPt2Page = new CuestionarioMedicoPt2Page(page);
    }

    async CapturarCuestionarioMedicoP2(IdiomaCotizacion: string, CapturaCuestionarioMedico: string) {
        if (CapturaCuestionarioMedico === 'No') {
            await this.cuestionarioMedicoPt2Page.CheckNoPA();
            await this.cuestionarioMedicoPt2Page.CheckNoPB();
            await this.cuestionarioMedicoPt2Page.CheckNoPC();
            await this.cuestionarioMedicoPt2Page.CheckNoPD();
            await this.cuestionarioMedicoPt2Page.CheckNoPE();
            await this.cuestionarioMedicoPt2Page.CheckNoPF();
            await this.cuestionarioMedicoPt2Page.CheckNoPG();
            await this.cuestionarioMedicoPt2Page.CheckNoPH();
            await this.cuestionarioMedicoPt2Page.CheckNoPI();
            await this.cuestionarioMedicoPt2Page.CheckNoPJ();
            await this.cuestionarioMedicoPt2Page.CheckNoPK();
            await this.cuestionarioMedicoPt2Page.CheckNoPL();
            await this.cuestionarioMedicoPt2Page.CheckNoPM();
            await this.cuestionarioMedicoPt2Page.CheckNoPN();
            await this.cuestionarioMedicoPt2Page.CheckNoPO();
            await this.cuestionarioMedicoPt2Page.CheckNoPP();
            await this.cuestionarioMedicoPt2Page.CheckNoPQ();
            await this.cuestionarioMedicoPt2Page.CheckNoPR();
        }
        await this.cuestionarioMedicoPt2Page.ClickBtnSiguiente();
        //Valida el cuestionatrio Parte II 
        const frame = this.page.frameLocator('iframe#ifCotizador');
        // 1️seguramos que el iframe esté cargado
        await frame.locator('body').waitFor({ state: 'attached', timeout: 10000 });

        // 2️Texto fijo de la pantalla 2 (AJUSTA ESTE TEXTO)
        const textoPantallaSeccion2 = 'Sección II';
        const pantallaSeccion2Visible = await frame
            .locator(`text=${textoPantallaSeccion2}`)
            .waitFor({ timeout: 8000 })
            .then(() => true)
            .catch(() => false);
        // 3️Lógica funcional
        if (pantallaSeccion2Visible) {
            console.log('Sección 2 del cuestionario médico detectada');
            await this.cuestionarioMedicoPt2Page.ClickCheckNoPA2();
            await this.cuestionarioMedicoPt2Page.ClickCheckNoPB2();
            await this.cuestionarioMedicoPt2Page.ClickCheckNoPC2();
            await this.cuestionarioMedicoPt2Page.ClickBtnSiguienteSeccion2();
        } else {
            console.log('Esta ejecución NO incluye la sección 2 del cuestionario');
        }


    }
}

export class PasoOchoConfirmacionDePlanYPagoFlow {
    private readonly confirmacionDePlanYPagoPage: ConfirmacionDePlanYPagoPage;
    constructor(private readonly page: Page) {
        this.confirmacionDePlanYPagoPage = new ConfirmacionDePlanYPagoPage(page);
    }

    async CapturarConfirmacionDePlanYPago() {
        await this.confirmacionDePlanYPagoPage.ClickBtnSiguienteConfirmacionDePlanYPago();
    }
}

export class PasoNueveTerminosyCondicionesFlow {
    private readonly terminosyCondicionesPage: TerminosyCondicionesPage;
    constructor(private readonly page: Page) {
        this.terminosyCondicionesPage = new TerminosyCondicionesPage(page);
    }

    async CapturarTerminosyCondiciones() {
        await this.terminosyCondicionesPage.ClickBtnAceptarTerminosyCondiciones();
        await this.terminosyCondicionesPage.ClickBtnSiguienteTerminosyCondiciones();
    }
}

export class PasoDiezDeclaracionFlow {
    private readonly declaracionPage: DeclaracionPage;
    constructor(private readonly page: Page) {
        this.declaracionPage = new DeclaracionPage(page);
    }

    async CapturarDeclaracion() {
        await this.declaracionPage.ClickBtnAceptaryFirmar();
        await this.declaracionPage.ClickBtnContinuarModal();
        await this.declaracionPage.clickBtnSubirFirma();
        await this.declaracionPage.SubirArchivoFirma();
        await this.declaracionPage.ClickBtnGuardarFirmas();
        await this.declaracionPage.ClickBtnSiguienteDeclaracion();
        //Valdiacion del modal de la firma del consultor
        // 1. Definimos el locator (Asegúrate de incluir el frameLocator si sigue dentro del iframe)
        const contenedorModal = this.page.locator('#modalConfirmar');
        const textoModal = contenedorModal.getByText(/Es necesario que firmes el contrato/i);
        // 2. FORZAR ESPERA: Esperamos a que el texto esté presente en el DOM
        // Usamos .catch(() => null) para que si no aparece después de 3s, no truene el test y simplemente siga al IF
        await textoModal.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
        // 3. AHORA SÍ revisamos la visibilidad
        if (await textoModal.isVisible()) {
            console.log("Modal detectado, procediendo a firmar...");
            // Clic en el botón Firmar dentro del modal
            await contenedorModal.locator('#btnFirmar').click();
        } else {
            console.log("El modal no apareció, el flujo continúa.");
        }
        await this.declaracionPage.ClickBtnDibujaTuFirmaConsultor();
        await this.declaracionPage.DibujaFirmaConsultor();
        await this.declaracionPage.ClickBtnFirmarDibujaTuFirmaConsultor();
        await this.declaracionPage.ClickBtnSiguienteDeclaracion();
    }
}


