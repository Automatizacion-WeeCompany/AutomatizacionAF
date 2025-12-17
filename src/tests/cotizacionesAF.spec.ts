import { test } from "@playwright/test";
import { InicioSesionAFFlow } from "../flows/cotizadorAF.flow";
import { HomeAFFlow } from "../flows/cotizadorAF.flow";
import { IniciarCotizacionFlow } from "../flows/cotizadorAF.flow";
import { PasoUnoDatosPersonalesFlow } from "../flows/cotizadorAF.flow";
import path from "path";
import { CargarExcel } from 'src/utilidades/CargaDatosExcel';
import { ExtraerDatosExcel } from "src/utilidades/ObtencionDeDatos";


const rutaExcel = path.join(__dirname, "../datos/SuitePruebas.xlsx");
const Escenarios = new CargarExcel(rutaExcel);
const Tests = ExtraerDatosExcel.obtenerEscenariosPorHoja('CotizadorAF');

test.describe('Cotizador AF', () => {
    for (const escenario of Tests) {
        test(`Escenario: ${escenario.EscenarioPrueba}`, async ({ page }) => {
            const inicioSesionAF = new InicioSesionAFFlow(page);
            const homeAF = new HomeAFFlow(page);
            const iniciarCotizacion = new IniciarCotizacionFlow(page);
            const pasoUnoDatosPersonales = new PasoUnoDatosPersonalesFlow(page);
            await inicioSesionAF.paginaInicio(escenario.Url);
            await inicioSesionAF.iniciarSesionAF(escenario.IdiomaCotizacion, escenario.CorreoInicio, escenario.Contrasena.toString());
            await homeAF.homeAF(escenario.IdiomaCotizacion);
            await iniciarCotizacion.iniciarCotizacion(escenario.IdiomaCotizacion);
            await pasoUnoDatosPersonales.CapturaDatosPersonales();
        })
    }
})