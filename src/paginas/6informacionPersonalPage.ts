import { expect, Page } from "@playwright/test";
import { seleccionarOpcionAleatoriaDesdeLocator } from "src/utilidades/SelectAleatoreo";

export class InformacionPersonalPage {
    constructor(private readonly page: Page) { }
    async IngresaSegundoNombre() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtNombreSegundo').waitFor({ state: 'visible', timeout: 15000 });
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtNombreSegundo').fill('Reveniew');
    }
    async IngresaFechaNacimiento(edadTitular: number) {
        const fechaActual = new Date();
        const fechaNacimiento = new Date(
            fechaActual.getFullYear() - edadTitular,
            fechaActual.getMonth(),
            Math.min(fechaActual.getDate(), 28),
        );
        const mes = String(fechaNacimiento.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaNacimiento.getDate()).padStart(2, '0');
        const fecha = `${mes}/${dia}/${fechaNacimiento.getFullYear()}`;
        const input = this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthdayTitular');

        await input.fill(fecha);
        await input.press('Tab');
        await expect(input).toHaveValue(fecha);
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
    async IngresaEstatura(estaturaCm?: number) {
        const alturaTitular = estaturaCm ?? await this.generarValorAleatorio(150, 170);
        await this.ingresarDatoAntropometrico('#Altura', alturaTitular);
        return alturaTitular;
    }
    async IngresaPeso(pesoKg?: number) {
        const pesoTitular = pesoKg ?? await this.generarValorAleatorio(50, 85);
        await this.ingresarDatoAntropometrico('#peso', pesoTitular);
        return pesoTitular;
    }
    private async generarValorAleatorio(min: number, max: number) {
        const { faker } = await import("@faker-js/faker");
        return faker.number.int({ min, max });
    }
    private async ingresarDatoAntropometrico(selector: string, valor: number) {
        if (!Number.isInteger(valor) || valor <= 0) {
            throw new Error(`El dato antropométrico debe ser un entero positivo: ${valor}`);
        }

        const input = this.page.frameLocator('iframe#ifCotizador').locator(selector);
        const valorEsperado = valor.toString();

        await expect(input).toBeVisible({ timeout: 15000 });
        await input.fill(valorEsperado);
        await input.press('Tab');
        await expect(input).toHaveValue(valorEsperado);
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
        await this.page.frameLocator('iframe#ifCotizador').locator('#OcupacionSelect').selectOption(
            { label: OcupacionTitular },
            { timeout: 10000 }
        );
    }
    async SeleccionaPaisCiudadaniaTitular() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#CiudadaniaActualSelect').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#CiudadaniaActualSelect'));
    }
    async SeleccionaTipoIdentificacionTitular(TipoIdentificacionTitular: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#TipoIDSelect1').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('#TipoIDSelect1').selectOption(
            { label: TipoIdentificacionTitular },
            { timeout: 10000 }
        );
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
        await this.page.frameLocator('iframe#ifCotizador').locator('#RelacionAseguradoSelectBeneficiario').selectOption(
            { label: RelacionSolicitantePrimario },
            { timeout: 10000 }
        );
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
        const guardadoBeneficiario = this.page.waitForResponse(
            response => response.request().method() === 'POST'
                && response.url().includes('/API/Cotizador/AddUpdateBeneficiarios'),
            { timeout: 30000 },
        );

        await this.page.frameLocator('iframe#ifCotizador').locator('#saveBeneficiario').click();
        const respuesta = await guardadoBeneficiario;

        if (!respuesta.ok()) {
            throw new Error(`No se pudo guardar el beneficiario: HTTP ${respuesta.status()}`);
        }

        await expect(
            this.page.frameLocator('iframe#ifCotizador').locator('#ModalAddBeneficiario')
        ).toBeHidden({ timeout: 10000 });
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
        const Anio = faker.number.int({ min: 2007, max: 2025 }).toString();
        const FechaNacimientoDependiente = `${Mes}/${Dia}/${Anio}`;
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday').pressSequentially(FechaNacimientoDependiente);
    }
    async ClickCheckSexoNacerDependienteMasculino() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optMasculinoBenefi"]').click();
        await expect(this.page.frameLocator('iframe#ifCotizador').locator('#optMasculinoBenefi')).toBeChecked();
    }
    async ClickCheckSexoNacerDependienteFemenino() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label.checkbox-design[for="optFemeninoBenef"]').click();
        await expect(this.page.frameLocator('iframe#ifCotizador').locator('#optFemeninoBenef')).toBeChecked();
    }
    async SeleccionaPaisNacimientoDependiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisNacimientoSelectDependiente').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisNacimientoSelectDependiente'));
    }
    async IngresaEstaturaDependiente() {
        const { faker } = await import("@faker-js/faker");
        const AlturaDependiente = faker.number.int({ min: 150, max: 170 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#AlturaDependiente').pressSequentially(AlturaDependiente);
    }
    async IngresaPesoDependiente() {
        const { faker } = await import("@faker-js/faker");
        const PesoDependiente = faker.number.int({ min: 50, max: 85 }).toString();
        await this.page.frameLocator('iframe#ifCotizador').locator('#pesoDependiente').pressSequentially(PesoDependiente);
    }
    async SeleccionaCiudadaniaDependiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelectDependienteSelectCiudadania').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelectDependienteSelectCiudadania'));
    }
    async ClickBtnGuardarHijo() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#saveDatos').click();
        await expect(
            this.page.frameLocator('iframe#ifCotizador').locator('#ModalAddDependiente')
        ).toBeHidden({ timeout: 10000 });
    }
    async ClickBtnCerrarModalDependiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#unloadContent').click();
    }
    async ClickBtnCerrarModalBeneficiario() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#unloadContent').click();
    }
    async ClickBtnSiguiente() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const botonSiguiente = iframe.locator('#GoNextStepOne');
        const cuestionarioCargado = iframe.locator('#GostepTwo');

        for (let intento = 1; intento <= 2; intento++) {
            await botonSiguiente.click();
            const avanzoAlCuestionario = await cuestionarioCargado
                .waitFor({ state: 'visible', timeout: 15000 })
                .then(() => true)
                .catch(() => false);

            if (avanzoAlCuestionario) {
                return;
            }
        }

        await expect(cuestionarioCargado).toBeVisible({ timeout: 15000 });
    }
    async ClickBtnGuardar() {
        const guardadoTitular = this.page.waitForResponse(
            response => response.request().method() === 'POST'
                && response.url().includes('/API/Cotizador/AddTitularCotizador'),
            { timeout: 30000 },
        );

        await this.page.frameLocator('iframe#ifCotizador').locator('#btnGuardarProcesoPaso1').click();
        const respuesta = await guardadoTitular;

        if (!respuesta.ok()) {
            throw new Error(`No se pudo guardar la informacion personal: HTTP ${respuesta.status()}`);
        }
    }
}
