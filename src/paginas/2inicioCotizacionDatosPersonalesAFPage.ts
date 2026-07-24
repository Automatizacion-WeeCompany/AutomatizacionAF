
import { Page } from "@playwright/test";
import { seleccionarOpcionAleatoriaDesdeLocator } from "src/utilidades/SelectAleatoreo";


export class InicioCotizacionDatosPersonalesAFPage {
    constructor(private readonly page: Page) { }

    async ingresaNombretitular() {
        const { faker } = await import("@faker-js/faker");
        const NombreTitular = faker.person.lastName().toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtNombre').pressSequentially(NombreTitular, { delay: 70 });
    }
    async ingresaApellidoTitular() {
        const { faker } = await import("@faker-js/faker");
        const ApellidoTitular = faker.person.firstName().toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtApPat').pressSequentially(ApellidoTitular, { delay: 70 });
    }
    async ingresaEdadTitular() {
        const { faker } = await import("@faker-js/faker");
        const edadTitular = faker.number.int({ min: 18, max: 45 });
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday').pressSequentially(edadTitular.toString(), { delay: 70 });
        return edadTitular;
    }
    async seleccionaPaisRecidenciaTitular() {
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisResidenciaSelect'));
    }
    async seleccionaTipoPolizaFamiliar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="chkTipoPoliza-Familiar"]').click();
    }
    async seleccionaTipoPolizaIndividual() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="chkTipoPoliza-Individual"]').click();
    }
    async checkConyugeParejaSi() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSi"]').nth(0).click();
    }
    async checkConyugeParejaNo() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNo"]').nth(0).click();
    }
    async ingresaEdadDependiente() {
        const { faker } = await import("@faker-js/faker");
        const EdadDependiente = faker.number.int({ min: 18, max: 76 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthdayConyugue').pressSequentially(EdadDependiente, { delay: 70 });
    }
    async seleccionaNumeroHijosMenoresDe24(HijosMenoresDe24: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#selectNumHijos').selectOption(HijosMenoresDe24);
    }
    async clickBtnContinuar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#GostepTwo').click();
    }
}
