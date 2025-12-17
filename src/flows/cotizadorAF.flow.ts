import { Page, expect } from "@playwright/test";
import { InicioSesionAFPage } from "../paginas/inicioSesionAFPage";
import { HomeAFPage } from "../paginas/homeAFPage";
import { cotizacionesPropuestasAFPage } from "../paginas/1cotizacionesPropuestasAFPage";
import { inicioCotizacionDatosPersonalesAFPage } from "../paginas/2inicioCotizacionDatosPersonalesAFPage";
import { ValidarTextos } from "src/utilidades/ValidarTextosPagina";
import { GeneradorDatos } from "src/utilidades/GeneradorDatos";

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
            await Promise.all([this.page.waitForNavigation(), this.page.locator('a.dropdown-item-lang', { hasText: 'ESP' }).click()]);
            const validacionTexto = 'Bienvenido';
            const visible = await this.page.locator(`text=${validacionTexto}`).isVisible();
            if (visible) {
                console.log(`Idioma cambiado correctamente, texto visible: ${validacionTexto}`);
            }
            else {
                throw new Error('No se detectó cambio de idioma a español');
            }
            console.log('Entrando en validacion de textos')
            const resultadoP = await ValidarTextos.validarTextosEsperados({ context: this.page, jsonPath: './src/textosEsperados/TextosEsperadosInicioSesionEsp.json' });
            if (resultadoP.estado !== 'Éxito') {
                GeneradorDatos.guardarResultadoJSON(resultadoP, './src/textosEsperados/textosFaltantes', 'TextosFaltantesInicioSesionEsp');
            }
        }
        else if (IdiomaCotizacion === 'Eng') {
            await this.inicioSesionAFPage.clickBtnCambioIdioma();
            await Promise.all([this.page.waitForNavigation(), this.page.locator('a.dropdown-item-lang', { hasText: 'ENG' }).click()]);
            const validacionTexto = 'Welcome';
            const visible = await this.page.locator(`text=${validacionTexto}`).isVisible();
            if (visible) {
                console.log(`Idioma cambiado correctamente, texto visible: ${validacionTexto}`);
            }
            else {
                throw new Error('No se detectó cambio de idioma a inglés');
            }
        }
        else if (IdiomaCotizacion === 'Port') {
            await this.inicioSesionAFPage.clickBtnCambioIdioma();
            await Promise.all([this.page.waitForNavigation(), this.page.locator('a.dropdown-item-lang', { hasText: 'PORT' }).click()]);
            const validacionTexto = 'Bem-vindo';
            const visible = await this.page.locator(`text=${validacionTexto}`).isVisible();
            if (visible) {
                console.log(`Idioma cambiado correctamente, texto visible: ${validacionTexto}`);
            }
            else {
                throw new Error('No se detectó cambio de idioma a portugués');
            }

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
    iniciarCotizacionPage: cotizacionesPropuestasAFPage;

    constructor(private readonly page: Page) {
        this.iniciarCotizacionPage = new cotizacionesPropuestasAFPage(this.page);
    }

    async iniciarCotizacion(IdiomaCotizacion: string) {
        await this.iniciarCotizacionPage.clickBtnNuevaCotizacion();
        switch (IdiomaCotizacion) {
            case 'Esp':
                const rutaJson = './src/textosEsperados/TextosEsperadosPropuestaCotizacionEsp.json';
                console.log('Validando textos en pantalla  Propuesta de cotizacion');
                const resultadoIframe = await ValidarTextos.validarTextosEnIframe({ page: this.page, iframeSelector: 'iframe#ifCotizador', jsonPath: rutaJson });
                if (resultadoIframe.estado !== 'Éxito') {
                    GeneradorDatos.guardarResultadoJSON(resultadoIframe, './src/textosEsperados/textosFaltantes', 'TextosFaltantesPropuestaDeCotizacionIframeEsp');
                }
                const placheolderNombre = this.page.frameLocator('iframe#ifCotizador').locator('input[placeholder="Escribe el nombre"]');
                const placheolderApellido = this.page.frameLocator('iframe#ifCotizador').locator('input[placeholder="Escribe el apellido"]');
                const inputTitular = this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday');
                await expect(inputTitular).toBeVisible();
                //const placheolderEdad = page.frameLocator('iframe#ifCotizador').locator('input[placeholder="0"]');
                console.log(`placheolderNombre: ${await placheolderNombre.isVisible()}`);
                console.log(`placheolderApellido: ${await placheolderApellido.isVisible()}`);
                console.log(`placheolderEdad: ${await inputTitular.isVisible()}`);
                if (await placheolderNombre.isVisible() && await placheolderApellido.isVisible() && await inputTitular.isVisible()) {
                    console.log('Todos los placheholder son visibles');
                }
                else {
                    GeneradorDatos.guardarResultadoJSON({ estado: 'Faltan textos', faltantes: ['Alguno o algunos Placheholder no son visibles'], fecha: new Date().toISOString() },
                        './placeholders', 'TextosFaltantesPlacheholder');
                }
                break;
            case 'Eng':
                const rutaJsonEng = './src/textosEsperados/TextosEsperadosPropuestaCotizacionEng.json';
                console.log('Validando textos en pantalla  Propuesta de cotizacion');
                const resultadoIframeEng = await ValidarTextos.validarTextosEnIframe({ page: this.page, iframeSelector: 'iframe#ifCotizador', jsonPath: rutaJsonEng });
                if (resultadoIframeEng.estado !== 'Éxito') {
                    GeneradorDatos.guardarResultadoJSON(resultadoIframeEng, './src/textosEsperados/textosFaltantes', 'TextosFaltantesPropuestaDeCotizacionIframeEng');
                }
                const placheolderNombreEng = this.page.frameLocator('iframe#ifCotizador').locator('input[placeholder="Escribe el nombre"]');
                const placheolderApellidoEng = this.page.frameLocator('iframe#ifCotizador').locator('input[placeholder="Escribe el apellido"]');
                const inputTitularEng = this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday');
                await expect(inputTitularEng).toBeVisible();
                //const placheolderEdad = page.frameLocator('iframe#ifCotizador').locator('input[placeholder="0"]');
                console.log(`placheolderNombre: ${await placheolderNombreEng.isVisible()}`);
                console.log(`placheolderApellido: ${await placheolderApellidoEng.isVisible()}`);
                console.log(`placheolderEdad: ${await inputTitularEng.isVisible()}`);
                if (await placheolderNombreEng.isVisible() && await placheolderApellidoEng.isVisible() && await inputTitularEng.isVisible()) {
                    console.log('Todos los placheholder son visibles');
                }
                else {
                    GeneradorDatos.guardarResultadoJSON({ estado: 'Faltan textos', faltantes: ['Alguno o algunos Placheholder no son visibles'], fecha: new Date().toISOString() },
                        './placeholders', 'TextosFaltantesPlacheholder');
                }
                break;
            case 'Port':
                const rutaJsonPort = './src/textosEsperados/TextosEsperadosPropuestaCotizacionPort.json';
                console.log('Validando textos en pantalla  Propuesta de cotizacion');
                const resultadoIframePort = await ValidarTextos.validarTextosEnIframe({ page: this.page, iframeSelector: 'iframe#ifCotizador', jsonPath: rutaJsonPort });
                if (resultadoIframePort.estado !== 'Éxito') {
                    GeneradorDatos.guardarResultadoJSON(resultadoIframePort, './src/textosEsperados/textosFaltantes', 'TextosFaltantesPropuestaDeCotizacionIframePort');
                }
                const placheolderNombrePort = this.page.frameLocator('iframe#ifCotizador').locator('input[placeholder="Escribe el nombre"]');
                const placheolderApellidoPort = this.page.frameLocator('iframe#ifCotizador').locator('input[placeholder="Escribe el apellido"]');
                const inputTitularPort = this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday');
                await expect(inputTitularPort).toBeVisible();
                //const placheolderEdad = page.frameLocator('iframe#ifCotizador').locator('input[placeholder="0"]');
                console.log(`placheolderNombre: ${await placheolderNombrePort.isVisible()}`);
                console.log(`placheolderApellido: ${await placheolderApellidoPort.isVisible()}`);
                console.log(`placheolderEdad: ${await inputTitularPort.isVisible()}`);
                if (await placheolderNombrePort.isVisible() && await placheolderApellidoPort.isVisible() && await inputTitularPort.isVisible()) {
                    console.log('Todos los placheholder son visibles');
                }
                else {
                    GeneradorDatos.guardarResultadoJSON({ estado: 'Faltan textos', faltantes: ['Alguno o algunos Placheholder no son visibles'], fecha: new Date().toISOString() },
                        './placeholders', 'TextosFaltantesPlacheholder');
                }
                break;
            default:
                throw new Error('Idioma no soportado revisar archivo de datos');
        }
    }
}

export class PasoUnoDatosPersonalesFlow {
    CapturaDatosPersonalesPage: inicioCotizacionDatosPersonalesAFPage;
    constructor(private page: Page) {
        this.CapturaDatosPersonalesPage = new inicioCotizacionDatosPersonalesAFPage(this.page);
    }
    async CapturaDatosPersonales() {
        await this.CapturaDatosPersonalesPage.ingresaNombretitular();
        await this.CapturaDatosPersonalesPage.ingresaApellidoTitular();
        await this.CapturaDatosPersonalesPage.ingresaEdadTitular();
        await this.CapturaDatosPersonalesPage.seleccionaPaisRecidenciaTitular();
        //await this.CapturaDatosPersonalesPage.clickBtnContinuar();
    }
}