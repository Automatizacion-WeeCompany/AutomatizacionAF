import { Page } from "@playwright/test";
import { seleccionarOpcionAleatoriaDesdeLocator } from "src/utilidades/SelectAleatoreo";

export class InformacionPersonalPage {
    constructor(private readonly page: Page) { }
    async IngresaSegundoNombre() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtNombreSegundo').waitFor({ state: 'visible', timeout: 15000 });
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtNombreSegundo').fill('Prueba Robot');
    }
    async IngresaFechaNacimiento() {
        const { faker } = await import("@faker-js/faker");
        const Dia = faker.number.int({ min: 1, max: 30 }).toString();
        const Mes = faker.number.int({ min: 1, max: 12 }).toString();
        const Anio = faker.number.int({ min: 1950, max: 2007 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthdayTitular').pressSequentially(`${Mes}/${Dia}/${Anio}`);
    }
    async CheckSexoMasculino() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optMasculino"]').click();
    }
    async CheckSexoFemenino() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optFemenino"]').click();
    }
    async SeleccionaPaisNacimiento() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisNacimientoSelect').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisNacimientoSelect'));
    }
    async CheckSoltero() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optSoltero"]').click();
    }
    async CheckCasado() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optCasado"]').click();
    }
    async IngresaEstatura() {
        const { faker } = await import("@faker-js/faker");
        const AlturaTitular = faker.number.int({ min: 150, max: 220 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#Altura').evaluate((el, value) => { (el as HTMLInputElement).value = value; }, AlturaTitular.toString());
    }
    async IngresaPeso() {
        const { faker } = await import("@faker-js/faker");
        const PesoTitular = faker.number.int({ min: 50, max: 120 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#peso').evaluate((el, value) => { (el as HTMLInputElement).value = value; }, PesoTitular.toString());
    }
    async IngresaNumeroCelular() {
        const { faker } = await import("@faker-js/faker");
        const NumeroCelularTitular = faker.phone.number({ style: "national" }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtCelular').fill(NumeroCelularTitular.toString());
    }
    async SeleccionaPaisTelefono() {
        await this.page.frameLocator('iframe#ifCotizador').locator('.iti__selected-country').first().click();
        await this.page.frameLocator('iframe#ifCotizador').locator('#iti-0__item-al').click();
    }
    async ClickBtnTelefonoSecundario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#secondaryCel').click();
    }
    async IngresaNumeroCelularSecundario() {
        const { faker } = await import("@faker-js/faker");
        const NumeroCelularTitular = faker.phone.number({ style: "national" }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtCelularSecondary').evaluate((el, value) => { (el as HTMLInputElement).value = value; }, NumeroCelularTitular.toString());
    }
    async SeleccionaPaisTelefonoSecundario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('.iti__selected-country-primary').first().click();
        await this.page.frameLocator('iframe#ifCotizador').locator('#iti-1__item-af').first().click();
    }
    async ClickBtonBasuraTelefonoSecundario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#destroyCellField').click();
    }
    async IngresaCorreoTitular() {
        const { faker } = await import("@faker-js/faker");
        const CorreoTitular = faker.internet.email({ provider: 'yopmail.com' }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtCorreoE').pressSequentially(CorreoTitular);
    }
    async SeleccionaOcupacionTitular(OcupacionTitular: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#OcupacionSelect').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('#OcupacionSelect').selectOption(OcupacionTitular);
    }
    async SeleccionaPaisCiudadaniaTitular() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#CiudadaniaActualSelect').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#CiudadaniaActualSelect'));
    }
    async SeleccionaTipoIdentificacionTitular(TipoIdentificacionTitular: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#TipoIDSelect1').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('#TipoIDSelect1').selectOption(TipoIdentificacionTitular);
    }
    async IngresaNumeroIdentificacionTitular() {
        const { faker } = await import("@faker-js/faker");
        const NumeroIdentificacionTitular = faker.number.int({ min: 1, max: 20 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtIdentificacion').pressSequentially(NumeroIdentificacionTitular);
    }
    async SeleccionaPaisExpedicionIdTitular() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelect').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelect'));
    }
    async AdjuntaArchivoIdTitular() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#idInputFileArchivo').setInputFiles('./src/datos/PruebaAF.pdf');
    }
    async IngresaDireccionResidencial() {
        const { faker } = await import("@faker-js/faker");
        const DireccionResidencial = faker.location.streetAddress();
        await this.page.frameLocator('iframe#ifCotizador').locator('#idInputDireccion1').pressSequentially(DireccionResidencial);
    }
    async IngresaCiudadResidencial() {
        const { faker } = await import("@faker-js/faker");
        const CiudadResidencial = faker.location.city();
        await this.page.frameLocator('iframe#ifCotizador').locator('#inputCiudadResidencia').pressSequentially(CiudadResidencial);
    }
    async SeleccionaEstadoResidencial() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#EstadoResidenciaSelect').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#EstadoResidenciaSelect'));
    }
    async IngresaCodigoPostalResidencial() {
        const { faker } = await import("@faker-js/faker");
        const CodigoPostalResidencial = faker.location.zipCode();
        await this.page.frameLocator('iframe#ifCotizador').locator('#inputCPResidencia').pressSequentially(CodigoPostalResidencial);
    }
    async ClickBtnAgregarDireccionDeCorrespondencia() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#idDireccionPostal').click();
    }
    async IngresaDireccionDeCorrespondencia() {
        const { faker } = await import("@faker-js/faker");
        const DireccionDeCorrespondencia = faker.location.streetAddress();
        await this.page.frameLocator('iframe#ifCotizador').locator('#idInputDireccion2').pressSequentially(DireccionDeCorrespondencia);
    }
    async SeleccionaPaisDeCorrespondencia() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisResidenciaSelectPostal').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisResidenciaSelectPostal'));
    }
    async IngresaCiudadDeCorrespondencia() {
        const { faker } = await import("@faker-js/faker");
        const CiudadDeCorrespondencia = faker.location.city();
        await this.page.frameLocator('iframe#ifCotizador').locator('#inputCiudadResidenciaPostal').pressSequentially(CiudadDeCorrespondencia);
    }
    async SeleccionaEstadoDeCorrespondencia() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#EstadoResidenciaSelectPostal').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#EstadoResidenciaSelectPostal'));
    }
    async IngresaCodigoPostalDeCorrespondencia() {
        const { faker } = await import("@faker-js/faker");
        const CodigoPostalDeCorrespondencia = faker.location.zipCode();
        await this.page.frameLocator('iframe#ifCotizador').locator('#inputCPPostal').pressSequentially(CodigoPostalDeCorrespondencia);
    }
    async ClickBtnEliminarDireccionDeCorrespondencia() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#deleteDirectionPostal').click();
    }
    async ClickBtnAgregarInfoBeneficiario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#openModalAddBeneficiarios').click();
    }
    async SeleccionaRelacionSolicitantePrimario(RelacionSolicitantePrimario: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#RelacionAseguradoSelectBeneficiario').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('#RelacionAseguradoSelectBeneficiario').selectOption(RelacionSolicitantePrimario);
    }
    async IngresaApellidoBeneficiario() {
        const { faker } = await import("@faker-js/faker");
        const ApellidoBeneficiario = faker.person.lastName();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtApPatBeneficiario').pressSequentially(ApellidoBeneficiario);
    }
    async IngresaNombreBeneficiario() {
        const { faker } = await import("@faker-js/faker");
        const NombreBeneficiario = faker.person.firstName();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtNombreBeneficiario').pressSequentially(NombreBeneficiario);
    }
    async IngresaFechaNacimientoBeneficiario() {
        const { faker } = await import("@faker-js/faker");
        const Dia = faker.number.int({ min: 1, max: 30 }).toString();
        const Mes = faker.number.int({ min: 1, max: 12 }).toString();
        const Anio = faker.number.int({ min: 1950, max: 2007 }).toString();
        const FechaNacimientoBeneficiario = `${Mes}/${Dia}/${Anio}`;
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthdayBeneficiario').pressSequentially(FechaNacimientoBeneficiario);
    }
    async SeleccionaPaisRecidenciaBeneficiario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisResidenciaSelectBenef').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisResidenciaSelectBenef'));
    }
    async SeleccionaCiudadaniaBeneficiario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisCiudadaniaSelectBenef').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisCiudadaniaSelectBenef'));
    }
    async IngresaTelefonoBeneficiario() {
        const { faker } = await import("@faker-js/faker");
        const TelefonoBeneficiario = faker.phone.number();
        await this.page.frameLocator('iframe#ifCotizador').locator('#NumTelefonoBenef').pressSequentially(TelefonoBeneficiario);
    }
    async IngresaCorreoBeneficiario() {
        const { faker } = await import("@faker-js/faker");
        const CorreoBeneficiario = faker.internet.email();
        await this.page.frameLocator('iframe#ifCotizador').locator('#idDireccionBenef').pressSequentially(CorreoBeneficiario);
    }
    async ClickBtnAgregarBeneficiario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#saveBeneficiario').click();
    }
    async ClickBtnAgregarHijo() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#openModalAddDependiente').click();
    }
    async ClickCheckHijoBiologico() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optHijoBio"]').click();
    }
    async ClickCheckHijoAdoptadoLegalmente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optLegalmente"]').click();
    }
    async ClickCheckHijastro() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optHijastro"]').click();
    }
    async ClickCheckMenorBajoCustodiaLegal() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optCustodia"]').click();
    }
    async IngresaApellidoDependiente() {
        const { faker } = await import("@faker-js/faker");
        const ApellidoDependiente = faker.person.lastName();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtApPatDependiente').pressSequentially(ApellidoDependiente);
    }
    async IngresaNombreDependiente() {
        const { faker } = await import("@faker-js/faker");
        const NombreDependiente = faker.person.firstName();
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtNombreDependiente').pressSequentially(NombreDependiente);
    }
    async IngresaFechaNacimientoDependiente() {
        const { faker } = await import("@faker-js/faker");
        const Dia = faker.number.int({ min: 1, max: 30 }).toString();
        const Mes = faker.number.int({ min: 1, max: 12 }).toString();
        const Anio = faker.number.int({ min: 2007, max: 2026 }).toString();
        const FechaNacimientoDependiente = `${Mes}/${Dia}/${Anio}`;
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday').pressSequentially(FechaNacimientoDependiente);
    }
    async ClickCheckSexoNacerDependienteMasculino() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optMasculinoBenefi"]').click();
    }
    async ClickCheckSexoNacerDependienteFemenino() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optFemeninoBenef"]').click();
    }
    async SeleccionaPaisNacimientoDependiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisNacimientoSelectDependiente').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisNacimientoSelectDependiente'));
    }
    async IngresaEstaturaDependiente() {
        const { faker } = await import("@faker-js/faker");
        const AlturaDependiente = faker.number.int({ min: 150, max: 250 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#AlturaDependiente').pressSequentially(AlturaDependiente);
    }
    async IngresaPesoDependiente() {
        const { faker } = await import("@faker-js/faker");
        const PesoDependiente = faker.number.int({ min: 50, max: 150 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#pesoDependiente').pressSequentially(PesoDependiente);
    }
    async SeleccionaCiudadaniaDependiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelectDependienteSelectCiudadania').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelectDependienteSelectCiudadania'));
    }
    async ClickBtnGuardarHijo() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#saveDatos').click();
    }
    async ClickBtnCerrarModalDependiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#unloadContent').click();
    }
    async ClickBtnCerrarModalBeneficiario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#unloadContent').click();
    }
    async ClickBtnSiguiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#GoNextStepOne').click();
    }
    async ClickBtnGuardar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#btnGuardarProcesoPaso1').click();
    }
}