import { test } from "@playwright/test";
import {
    InicioSesionAFFlow, HomeAFFlow, IniciarCotizacionFlow, PasoUnoDatosPersonalesFlow, PasoDosPlanesFlow,
    PasoTresCotizacionFlow, PasoCuatroResumenCotizacionFlow, PasoCincoInformacionPersonalFlow, PasoSeisCuestionarioMedicoFlow, PasoSieteCuestionarioMedicoFlow,
    PasoOchoConfirmacionDePlanYPagoFlow, PasoNueveTerminosyCondicionesFlow, PasoDiezDeclaracionFlow
} from "../flows/cotizadorAF.flow";
import { InicioSesionEmisionClaimsAfFlow, EmisionClaimsAfFlow } from "../flows/emisionClaimsAf.flow";
import path from "node:path";
import { CargarExcel } from 'src/utilidades/CargaDatosExcel';
import { ExtraerDatosExcel } from "src/utilidades/ObtencionDeDatos";


const rutaExcel = path.join(__dirname, "../datos/SuitePruebas.xlsx");
const Escenarios = new CargarExcel(rutaExcel);
const Tests = ExtraerDatosExcel.obtenerEscenariosPorHoja('CotizadorAF');
const TestsEmision = ExtraerDatosExcel.obtenerEscenariosPorHoja('EmisionAF');

test.describe('Cotizador AF', () => {
    for (const escenario of Tests.filter(test => test.EscenarioPrueba)) {
        test(`Escenario: ${escenario.EscenarioPrueba}`, async ({ page }) => {
            const inicioSesionAF = new InicioSesionAFFlow(page);
            const homeAF = new HomeAFFlow(page);
            const iniciarCotizacion = new IniciarCotizacionFlow(page);
            const pasoUnoDatosPersonales = new PasoUnoDatosPersonalesFlow(page);
            const pasoDosPlanes = new PasoDosPlanesFlow(page);
            const pasoTresCotizacion = new PasoTresCotizacionFlow(page);
            const pasoCuatroResumenCotizacion = new PasoCuatroResumenCotizacionFlow(page);
            const pasoCincoInformacionPersonal = new PasoCincoInformacionPersonalFlow(page);
            const pasoSeisCuestionarioMedico = new PasoSeisCuestionarioMedicoFlow(page);
            const pasoSieteCuestionarioMedico = new PasoSieteCuestionarioMedicoFlow(page);
            const pasoOchoConfirmacionDePlanYPago = new PasoOchoConfirmacionDePlanYPagoFlow(page);
            const pasoNueveTerminosyCondicionesFlow = new PasoNueveTerminosyCondicionesFlow(page);
            const pasoDiezDeclaracion = new PasoDiezDeclaracionFlow(page);
            await inicioSesionAF.paginaInicio(escenario.Url);
            await inicioSesionAF.iniciarSesionAF(escenario.IdiomaCotizacion, escenario.CorreoInicio, escenario.Contrasena.toString());
            await homeAF.homeAF(escenario.IdiomaCotizacion);
            await iniciarCotizacion.iniciarCotizacion(escenario.IdiomaCotizacion);
            await pasoUnoDatosPersonales.CapturaDatosPersonales(escenario.TipoPoliza, escenario.ConyugePareja, escenario.HijosMenoresDe24.toString());
            await pasoDosPlanes.seleccionarPlanes(escenario.IdiomaCotizacion, escenario.CotizarPlan, escenario.RedProveedores, escenario.Deducible, escenario.FrecuenciaPago);
            await pasoTresCotizacion.resumenCotizacion(escenario.IdiomaCotizacion);
            await pasoCuatroResumenCotizacion.resumenPlanesCot(escenario.IdiomaCotizacion);
            await pasoCincoInformacionPersonal.informacionPersonal(escenario);
            await pasoSeisCuestionarioMedico.CapturarCuestionarioMedicoP1(escenario.IdiomaCotizacion, escenario.CuestionarioMedicoCaptura, escenario.P5Sustancia, escenario.SigueIngiriendo);
            await pasoSieteCuestionarioMedico.CapturarCuestionarioMedicoP2(escenario.IdiomaCotizacion, escenario.CapturaPreguntasPt2);
            await pasoOchoConfirmacionDePlanYPago.CapturarConfirmacionDePlanYPago();
            await pasoNueveTerminosyCondicionesFlow.CapturarTerminosyCondiciones();
            await pasoDiezDeclaracion.CapturarDeclaracion();
        })
    }
})

test.describe('Emision Claims AF', () => {
    for (const escenarioEmision of TestsEmision.filter(test => test.EscenarioPrueba)) {
        test(`Escenario: ${escenarioEmision.EscenarioPrueba}`, async ({ page }) => {
            const inicioSesionEmisionClaimsAf = new InicioSesionEmisionClaimsAfFlow(page);
            const emisionClaimsAf = new EmisionClaimsAfFlow(page);
            await inicioSesionEmisionClaimsAf.inicioSesionEmisionClaimsAf(escenarioEmision.UrlClaims, escenarioEmision.CorreoClaims, escenarioEmision.ContrasenaClaims);
            await emisionClaimsAf.emisionClaimsAf(escenarioEmision.FolioSolicitante.toString());
            await page.waitForTimeout(10000);
        })
    }
})