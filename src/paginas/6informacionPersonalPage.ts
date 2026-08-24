import { expect, Page } from "@playwright/test";
import { seleccionarOpcionAleatoriaDesdeLocator } from "src/utilidades/SelectAleatoreo";

export class InformacionPersonalPage {
    constructor(private readonly page: Page) { }
    async IngresaSegundoNombre(numeroFlujo: number) {
        if (!Number.isInteger(numeroFlujo) || numeroFlujo <= 0) {
            throw new Error(`El número de flujo debe ser un entero positivo: ${numeroFlujo}`);
        }

        const segundoNombre = `WeeBoot ${numeroFlujo}`;
        const campoSegundoNombre = this.page.frameLocator('iframe#ifCotizador').locator('#txtNombreSegundo');

        await campoSegundoNombre.waitFor({ state: 'visible', timeout: 15000 });
        await campoSegundoNombre.evaluate((elemento, valor) => {
            const input = elemento as HTMLInputElement;
            const conservaValidacionLetras = input.classList.contains('ValidLetters');
            const asignarValor = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                'value',
            )?.set;

            input.classList.remove('ValidLetters');
            asignarValor?.call(input, valor);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            asignarValor?.call(input, valor);

            if (conservaValidacionLetras) {
                input.classList.add('ValidLetters');
            }
        }, segundoNombre);
        await expect(campoSegundoNombre).toHaveValue(segundoNombre);
        return segundoNombre;
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
    async IngresaEstatura(estaturaCm = 170) {
        const alturaTitular = estaturaCm;
        await this.ingresarDatoAntropometrico('#Altura', alturaTitular);
        return alturaTitular;
    }
    async IngresaPeso(pesoKg = 65) {
        const pesoTitular = pesoKg;
        await this.ingresarDatoAntropometrico('#peso', pesoTitular);
        return pesoTitular;
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
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtCelularSecondary').evaluate((el, value) => {
            const input = el as HTMLInputElement;
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }, NumeroCelularTitular.toString());
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
        const select = this.page
            .frameLocator('iframe#ifCotizador')
            .locator('#PaisResidenciaSelectBenef');
        await expect(select).toBeVisible({ timeout: 15000 });
        if (await select.isDisabled()) {
            await expect(select).not.toHaveValue('');
            return;
        }
        await seleccionarOpcionAleatoriaDesdeLocator(select);
    }
    async SeleccionaCiudadaniaBeneficiario() {
        const select = this.page
            .frameLocator('iframe#ifCotizador')
            .locator('#PaisCiudadaniaSelectBenef');
        await expect(select).toBeVisible({ timeout: 15000 });
        if (await select.isDisabled()) {
            await expect(select).not.toHaveValue('');
            return;
        }
        await seleccionarOpcionAleatoriaDesdeLocator(select);
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
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const botonAgregarHijo = iframe
            .getByRole('button', {
                name: /Add Child|Agregar Hijo|Adicionar Filho/i,
            })
            .first();
        await expect(botonAgregarHijo).toBeVisible({ timeout: 15000 });
        await botonAgregarHijo.click({ timeout: 15000 });
        await expect(iframe.locator('#ModalAddDependiente')).toBeVisible({ timeout: 15000 });
    }
    async ClickBtnAgregarConyuge() {
        const botonAgregarConyuge = this.page
            .frameLocator('iframe#ifCotizador')
            .getByRole('button', {
                name: /Add Spouse\s*\/\s*Domestic Partner|Agregar Cónyuge\s*\/\s*Pareja Doméstica|Adicionar Cônjuge\s*\/\s*Parceiro(?:\(a\))?/i,
            })
            .first();
        await expect(botonAgregarConyuge).toBeVisible({ timeout: 15000 });
        await botonAgregarConyuge.click();
        await expect(
            this.page.frameLocator('iframe#ifCotizador').locator('#ModalAddDependiente'),
        ).toBeVisible({ timeout: 15000 });
    }
    async ClickCheckConyuge() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        await iframe.locator('label.checkbox-design[for="optConyugue"]').click();
        await expect(iframe.locator('#optConyugue')).toBeChecked();
    }
    async ClickCheckHijoBiologico() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const opcion = iframe.locator('label.checkbox-design[for="optHijoBio"]');
        await expect(opcion).toBeVisible({ timeout: 15000 });
        await opcion.click({ timeout: 15000 });
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
    async IngresaFechaNacimientoDependiente(edadDependiente = 10) {
        if (!Number.isInteger(edadDependiente) || edadDependiente < 0 || edadDependiente > 23) {
            throw new Error(`Edad de hijo/dependiente inválida: ${edadDependiente}`);
        }
        const fechaActual = new Date();
        const Dia = String(Math.min(fechaActual.getDate(), 28)).padStart(2, '0');
        const Mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const Anio = String(fechaActual.getFullYear() - edadDependiente);
        const FechaNacimientoDependiente = `${Mes}/${Dia}/${Anio}`;
        const input = this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday');
        await input.fill(FechaNacimientoDependiente);
        await input.press('Tab');
        await expect(input).toHaveValue(FechaNacimientoDependiente);
    }
    async IngresaFechaNacimientoConyuge(edadConyuge: number) {
        if (!Number.isInteger(edadConyuge) || edadConyuge < 18) {
            throw new Error(`Edad de cónyuge inválida: ${edadConyuge}`);
        }

        const fechaActual = new Date();
        const fechaNacimiento = new Date(
            fechaActual.getFullYear() - edadConyuge,
            fechaActual.getMonth(),
            Math.min(fechaActual.getDate(), 28),
        );
        const mes = String(fechaNacimiento.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaNacimiento.getDate()).padStart(2, '0');
        const fecha = `${mes}/${dia}/${fechaNacimiento.getFullYear()}`;
        const input = this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday');

        await input.fill(fecha);
        await input.press('Tab');
        await expect(input).toHaveValue(fecha);
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
    async IngresaEstaturaDependiente(estaturaCm = 135) {
        const alturaDependiente = estaturaCm;
        await this.ingresarDatoAntropometrico('#AlturaDependiente', alturaDependiente);
        return alturaDependiente;
    }
    async IngresaPesoDependiente(pesoKg = 32) {
        const pesoDependiente = pesoKg;
        await this.ingresarDatoAntropometrico('#pesoDependiente', pesoDependiente);
        return pesoDependiente;
    }
    async SeleccionaCiudadaniaDependiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelectDependienteSelectCiudadania').click();
        await seleccionarOpcionAleatoriaDesdeLocator(this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelectDependienteSelectCiudadania'));
    }
    async ClickCheckEstadoCivilConyuge() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        await iframe.locator('label.checkbox-design[for="optCasadoBenef"]').click();
        await expect(iframe.locator('#optCasadoBenef')).toBeChecked();
    }
    async IngresaTelefonoConyuge() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const input = iframe.locator('#txtCelularDependiente');
        await expect(input).toBeVisible({ timeout: 15000 });
        await input.fill('5555550101');
        await expect(input).toHaveValue('5555550101');
    }
    async IngresaCorreoConyuge() {
        const { faker } = await import("@faker-js/faker");
        const correo = faker.internet.email({ provider: 'yopmail.com' });
        const input = this.page.frameLocator('iframe#ifCotizador').locator('#txtCorreoDEpendioente');
        await input.fill(correo);
        await expect(input).toHaveValue(correo);
    }
    async SeleccionaOcupacionConyuge(ocupacion: string) {
        const select = this.page.frameLocator('iframe#ifCotizador').locator('#OcupacionSelectDependiente');
        await select.selectOption({ label: ocupacion }, { timeout: 10000 });
        await expect(select).not.toHaveValue('');
    }
    async IngresaNumeroIdentificacionConyuge() {
        const { faker } = await import("@faker-js/faker");
        const numero = faker.string.numeric(10);
        const input = this.page.frameLocator('iframe#ifCotizador').locator('#txtNumeroVerificacionDependiente');
        await expect(input).toBeVisible({ timeout: 15000 });
        await input.fill(numero);
        await expect(input).toHaveValue(numero);
    }
    async SeleccionaTipoIdentificacionConyuge(tipoIdentificacion: string) {
        const select = this.page.frameLocator('iframe#ifCotizador').locator('#tipoIDselectDependiente');
        await select.selectOption({ label: tipoIdentificacion }, { timeout: 10000 });
        await expect(select).not.toHaveValue('');
    }
    async EsVisibleIdentificacionConyuge() {
        return this.page
            .frameLocator('iframe#ifCotizador')
            .locator('#tipoIDselectDependiente')
            .isVisible();
    }
    async SeleccionaPaisExpedicionIdConyuge() {
        await seleccionarOpcionAleatoriaDesdeLocator(
            this.page.frameLocator('iframe#ifCotizador').locator('#PaisEmisionSelectDependienteSelect'),
        );
    }
    async SeleccionaPaisResidenciaConyuge() {
        const select = this.page
            .frameLocator('iframe#ifCotizador')
            .locator('#PaisResidenciaSelectDependientes');
        await expect(select).toBeVisible({ timeout: 15000 });
        if (await select.isDisabled()) {
            await expect(select).not.toHaveValue('');
            return;
        }
        await seleccionarOpcionAleatoriaDesdeLocator(select);
    }
    async SeleccionaNoEstudianteConyuge() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const opcionNo = iframe.locator('#optENO');
        if (await opcionNo.isVisible()) {
            await iframe.locator('label.checkbox-design[for="optENO"]').click();
            await expect(opcionNo).toBeChecked();
        }
    }
    async SeleccionaSiEstudianteDependiente() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const opcionSi = iframe.locator('#optESI');
        if (await opcionSi.isVisible()) {
            await iframe.locator('label.checkbox-design[for="optESI"]').click();
            await expect(opcionSi).toBeChecked();
        }
    }
    async ClickBtnGuardarHijo() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const botonGuardar = iframe.locator('#saveDatos');
        await expect(botonGuardar).toBeVisible({ timeout: 15000 });
        await expect(botonGuardar).toBeEnabled({ timeout: 15000 });
        await botonGuardar.click({ timeout: 15000 });
        await expect(
            iframe.locator('#ModalAddDependiente')
        ).toBeHidden({ timeout: 15000 });
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
