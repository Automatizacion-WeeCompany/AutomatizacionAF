import { faker } from "@faker-js/faker";
import { Page } from "@playwright/test";
import { seleccionarOpcionAleatoriaOriginal } from "src/utilidades/SelectAleatoreo";

export class inicioCotizacionDatosPersonalesAFPage {
    constructor(private readonly page: Page) { }

    async ingresaNombretitular() {
        const NombreTitular = faker.person.lastName().toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtNombre').pressSequentially(NombreTitular, { delay: 70 });
    }
    async ingresaApellidoTitular() {
        const ApellidoTitular = faker.person.firstName().toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtApPat').pressSequentially(ApellidoTitular, { delay: 70 });
    }
    async ingresaEdadTitular() {
        const EdadTitular = faker.number.int({ min: 18, max: 76 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday').pressSequentially(EdadTitular, { delay: 70 });
    }
    async seleccionaPaisRecidenciaTitular() {
        const iframePaisRecidencia = this.page.frameLocator('iframe#ifCotizador').locator('#PaisResidenciaSelect').toString();
        await seleccionarOpcionAleatoriaOriginal(this.page, iframePaisRecidencia);

    }
    async clickBtnContinuar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#GostepTwo').click();
    }
}