import { Page, test } from "@playwright/test";
import {
    InicioSesionAFFlow, HomeAFFlow, IniciarCotizacionFlow, PasoUnoDatosPersonalesFlow, PasoDosPlanesFlow,
    PasoTresCotizacionFlow, PasoCuatroResumenCotizacionFlow, PasoCincoInformacionPersonalFlow, PasoSeisCuestionarioMedicoFlow, PasoSieteCuestionarioMedicoFlow,
    PasoOchoConfirmacionDePlanYPagoFlow, PasoNueveTerminosyCondicionesFlow, PasoDiezDeclaracionFlow,
    PasoOnceAplicacionCompletaFlow, PasoDoceRegistrarInformacionPagoFlow, PasoTreceMetodoPagoFlow
} from "../flows/cotizadorAF.flow";
import { InicioSesionEmisionClaimsAfFlow, EmisionClaimsAfFlow } from "../flows/emisionClaimsAf.flow";
import { ExtraerDatosExcel } from "src/utilidades/ObtencionDeDatos";
import { EscenarioExcel } from "src/types/EscenarioExcel";


const Tests: EscenarioExcel[] = ExtraerDatosExcel.obtenerEscenariosPorHoja('CotizadorAF');
const TestsEmision = ExtraerDatosExcel.obtenerEscenariosPorHoja('EmisionAF');

async function ejecutarFlujoCotizacion(
    page: Page,
    escenario: EscenarioExcel,
) {
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
    await inicioSesionAF.iniciarSesionAF(
        escenario.IdiomaCotizacion,
        escenario.CorreoInicio,
        escenario.Contrasena.toString(),
    );
    await homeAF.homeAF(escenario.IdiomaCotizacion);
    await iniciarCotizacion.iniciarCotizacion(escenario.IdiomaCotizacion);
    const edadTitular = await pasoUnoDatosPersonales.CapturaDatosPersonales(
        escenario.TipoPoliza,
        escenario.ConyugePareja,
        String(escenario.HijosMenoresDe24 ?? ""),
    );
    await pasoDosPlanes.seleccionarPlanes(
        escenario.IdiomaCotizacion,
        escenario.CotizarPlan,
        escenario.RedProveedores,
        escenario.Deducible,
        escenario.FrecuenciaPago,
    );
    await pasoTresCotizacion.resumenCotizacion(escenario.IdiomaCotizacion);
    await pasoCuatroResumenCotizacion.resumenPlanesCot(escenario.IdiomaCotizacion);
    await pasoCincoInformacionPersonal.informacionPersonal(escenario, edadTitular);
    await pasoSeisCuestionarioMedico.CapturarCuestionarioMedicoP1(
        escenario.IdiomaCotizacion,
        escenario.CuestionarioMedicoCaptura,
        escenario.P5Sustancia,
        escenario.SigueIngiriendo,
    );
    await pasoSieteCuestionarioMedico.CapturarCuestionarioMedicoP2(
        escenario.IdiomaCotizacion,
        escenario.CapturaPreguntasPt2,
    );
    await pasoOchoConfirmacionDePlanYPago.CapturarConfirmacionDePlanYPago();
    await pasoNueveTerminosyCondicionesFlow.CapturarTerminosyCondiciones();
    await pasoDiezDeclaracion.CapturarDeclaracion();

    const pasoOnceAplicacionCompleta = new PasoOnceAplicacionCompletaFlow(page);

    if (escenario.TipoPoliza === "Individual") {
        await pasoOnceAplicacionCompleta.ValidarAplicacionEnEvaluacion(
            escenario.IdiomaCotizacion,
        );
        return;
    }

    const pasoDoceRegistrarInformacionPago = new PasoDoceRegistrarInformacionPagoFlow(page);
    const pasoTreceMetodoPago = new PasoTreceMetodoPagoFlow(page);

    await pasoOnceAplicacionCompleta.CapturarAplicacionCompleta();
    await pasoDoceRegistrarInformacionPago.CapturarInformacionPago();
    await pasoTreceMetodoPago.CapturarMetodoPago(escenario.IdiomaCotizacion);
}

test.describe('Cotizador AF', () => {
    for (const escenario of Tests.filter(escenario => escenario.EscenarioPrueba)) {
        test(`Escenario: ${escenario.EscenarioPrueba} ${escenario.IdiomaCotizacion}`, async ({ page }) => {
            await ejecutarFlujoCotizacion(page, escenario);
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
