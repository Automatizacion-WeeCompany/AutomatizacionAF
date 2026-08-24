
import { expect, Page } from "@playwright/test";
import { seleccionarOpcionAleatoriaDesdeLocator } from "src/utilidades/SelectAleatoreo";
import { OpcionPaisResidencia } from "../types/ValidacionTarifas";

export class InicioCotizacionDatosPersonalesAFPage {
    constructor(private readonly page: Page) { }

    private get selectorPaisResidencia() {
        return this.page
            .frameLocator('iframe#ifCotizador')
            .locator('#PaisResidenciaSelect');
    }

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
    async ingresaEdadTitular(edadTitular = 35) {
        if (!Number.isInteger(edadTitular) || edadTitular < 18 || edadTitular > 76) {
            throw new Error(`Edad de titular fuera del rango asegurable del flujo completo: ${edadTitular}`);
        }
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthday').pressSequentially(edadTitular.toString(), { delay: 70 });
        return edadTitular;
    }
    async obtenerPaisesResidenciaTitular(): Promise<OpcionPaisResidencia[]> {
        const selector = this.selectorPaisResidencia;
        await selector.waitFor({ state: 'visible', timeout: 15000 });
        await expect.poll(
            () => selector.locator('option').count(),
            {
                timeout: 15000,
                message: 'El catálogo de países de residencia no terminó de cargar',
            },
        ).toBeGreaterThan(1);

        const opciones = await selector.locator('option').evaluateAll((elementos) =>
            elementos.map((elemento) => ({
                valor: elemento.getAttribute('value')?.trim() ?? '',
                texto: elemento.textContent?.trim() ?? '',
                deshabilitada: (elemento as HTMLOptionElement).disabled,
            })),
        );
        const paises = opciones
            .filter(
                ({ valor, texto, deshabilitada }) =>
                    Boolean(valor) &&
                    Boolean(texto) &&
                    !deshabilitada &&
                    !/^(seleccione|select|selecione)\b/i.test(texto),
            )
            .map(({ valor, texto }) => ({ valor, texto }));

        const valoresUnicos = new Set(paises.map(({ valor }) => valor));
        if (paises.length === 0 || valoresUnicos.size !== paises.length) {
            throw new Error(
                `El catálogo de países de residencia es inválido. Opciones válidas: ${paises.length}; valores únicos: ${valoresUnicos.size}`,
            );
        }

        return paises;
    }

    async seleccionaPaisRecidenciaTitular(pais?: OpcionPaisResidencia) {
        if (!pais) {
            const seleccion = await seleccionarOpcionAleatoriaDesdeLocator(
                this.selectorPaisResidencia,
            );
            return { valor: seleccion.value, texto: seleccion.text };
        }

        const paises = await this.obtenerPaisesResidenciaTitular();
        const opcion = paises.find(({ valor }) => valor === pais.valor);
        if (!opcion) {
            throw new Error(
                `El país de residencia "${pais.texto}" (${pais.valor}) no está disponible en el selector`,
            );
        }

        await this.selectorPaisResidencia.selectOption(pais.valor);
        await expect(this.selectorPaisResidencia).toHaveValue(pais.valor);
        const textoSeleccionado = (
            await this.selectorPaisResidencia.locator('option:checked').innerText()
        ).trim();

        return { valor: pais.valor, texto: textoSeleccionado };
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
    async ingresaEdadDependiente(edadDependiente = 35) {
        if (!Number.isInteger(edadDependiente) || edadDependiente < 18 || edadDependiente > 76) {
            throw new Error(`Edad de cónyuge fuera del rango asegurable del flujo completo: ${edadDependiente}`);
        }
        await this.page.frameLocator('iframe#ifCotizador').locator('#datepickerBirthdayConyugue').pressSequentially(edadDependiente.toString(), { delay: 70 });
        return edadDependiente;
    }
    async seleccionaNumeroHijosMenoresDe24(HijosMenoresDe24: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#selectNumHijos').selectOption(HijosMenoresDe24);
    }
    async clickBtnContinuar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#GostepTwo').click();
    }
}
