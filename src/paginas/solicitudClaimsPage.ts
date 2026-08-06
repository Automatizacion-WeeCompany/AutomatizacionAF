import { expect, Locator, Page } from "@playwright/test";

export interface PersonaClaims {
  titulo: string;
  campos: Record<string, string>;
}

const CAMPOS_SOLICITANTE_PRIMARIO = {
  apellidos: "#PrimarioApellido",
  primerNombre: "#PrimarioPNombre",
  segundoNombre: "#PrimarioSNombre",
  fechaNacimiento: "#PrimarioFechaNacimiento",
  sexoAlNacer: "#PrimarioSNacer",
  paisNacimiento: "#PrimarioPnacimiento",
  estadoCivil: "#PrimarioECivil",
  estatura: "#PrimarioEstatura",
  peso: "#PrimarioPeso",
  telefonoCelular: "#PrimarioNtCelular",
  telefonoSecundario: "#PrimarioNTSecundario",
  correoElectronico: "#PrimarioDCElectronico",
  ocupacion: "#PrimarioOcupacion",
  ciudadania: "#PrimarioCiudadania",
  tipoIdentificacion: "#PrimarioTIdentificacion",
  numeroIdentificacion: "#PrimarioNIdentificacion",
  paisExpedicion: "#PrimarioPaisExpedicion",
  archivoIdentificacion: "#PrimarioCopiaIdentifiacion",
  direccionResidencial: "#PrimarioDireccionNP",
  paisResidencia: "#PrimarioPaisResidenciaNP",
  ciudadResidencial: "#PrimarioCiudadNP",
  estadoResidencial: "#PrimarioEstadoNP",
  codigoPostalResidencial: "#PrimarioCodigoPostalNP",
  direccionCorrespondencia: "#PrimarioDireccionCorrespondencia",
  paisCorrespondencia: "#PrimarioPaisResidenciaCorrespondencia",
  ciudadCorrespondencia: "#PrimarioCiudadCorrespondencia",
  estadoCorrespondencia: "#PrimarioEstadoCorrespondencia",
  codigoPostalCorrespondencia: "#PrimarioCodigoPostalCorrespondencia",
} as const;

const CAMPOS_BENEFICIARIO = {
  apellidos: "#BeneficiarioApellidos",
  primerNombre: "#BeneficiarioPrimerNombre",
  segundoNombre: "#BeneficiarioSegundoNombre",
  fechaNacimiento: "#BeneficiarioFNacimiento",
  telefonoCelular: "#BeneficiarioNTCelular",
  correoElectronico: "#BeneficiarioDCElectronico",
  ciudadania: "#BeneficiarioCiudadania",
  paisResidencia: "#BeneficiarioPResidencia",
} as const;

export class SolicitudClaimsPage {
  constructor(private readonly page: Page) {}

  private async abrirPestana(href: string) {
    const enlace = this.page.locator(`a[href="${href}"]`).first();
    const panel = this.page.locator(href);

    await expect(enlace).toBeVisible({ timeout: 15000 });
    await enlace.click();
    await expect(panel).toBeVisible({ timeout: 15000 });
  }

  private async texto(locator: Locator) {
    if ((await locator.count()) === 0) {
      return "";
    }
    return (await locator.first().innerText()).trim();
  }

  private async obtenerCamposPorSelector(
    campos: Record<string, string>,
  ): Promise<Record<string, string>> {
    const resultado: Record<string, string> = {};

    for (const [campo, selector] of Object.entries(campos)) {
      resultado[campo] = await this.texto(this.page.locator(selector));
    }

    return resultado;
  }

  async ClickBtnGenerarDocumentacion() {
    await this.page.click("#regeneraDocs");
  }

  async ClickBtnPrepolizaPagada() {
    await this.page.click("#polizaEstatus");
  }

  async ClickBtnAtenderSolicitud() {
    const boton = this.page
      .getByText(/Atender solicitud/i, { exact: true })
      .first();

    await expect(boton).toBeVisible({ timeout: 15000 });
    await boton.click();
    await expect(boton).toBeHidden({ timeout: 15000 });
    await expect(
      this.page.locator('a[href="#InformacionGeneralEmision"]'),
    ).toBeVisible();
  }

  async ClickPestanaInformacionGeneral() {
    await this.abrirPestana("#InformacionGeneralEmision");
  }

  async ClickPestanaCoberturasDeSeguros() {
    await this.abrirPestana("#CoberturasSeguros");
  }

  async ClickPestanaCuestionario() {
    await this.abrirPestana("#Cuestionario");
  }

  async ClickPestanaPlanyFrecuenciaPago() {
    await this.abrirPestana("#PlanPago");
  }

  async ClickPestanaIdioma() {
    await this.abrirPestana("#Idioma");
  }

  async ClickPestanaLimitaciones() {
    await this.abrirPestana("#Exclusiones");
  }

  async ClickPestanaContrato() {
    await this.abrirPestana("#Contrato");
  }

  async obtenerSolicitantePrimario() {
    await this.ClickPestanaInformacionGeneral();
    await expect(this.page.locator("#PrimarioPNombre")).not.toHaveText("");
    return this.obtenerCamposPorSelector(CAMPOS_SOLICITANTE_PRIMARIO);
  }

  async obtenerDependientes(): Promise<PersonaClaims[]> {
    await this.ClickPestanaInformacionGeneral();
    const acordeon = this.page.locator("#InformacionParejaEmision");
    const grupos = this.page.locator("#AcordionInAcordion > li");

    if ((await grupos.locator("span.value").count()) === 0) {
      if (!(await acordeon.isVisible())) {
        return [];
      }
      await acordeon.click({ timeout: 5000 });
      if ((await grupos.locator("span.value").count()) === 0) {
        return [];
      }
    }

    return grupos.evaluateAll((elementos) =>
      elementos
        .map((elemento) => {
          const titulo =
            elemento
              .querySelector(":scope > .collapsible-header")
              ?.textContent?.trim()
              .replace(/\s+/g, " ") ?? "";
          const campos: Record<string, string> = {};

          for (const etiqueta of Array.from(
            elemento.querySelectorAll<HTMLLabelElement>("label"),
          )) {
            const valor = etiqueta.querySelector<HTMLElement>("span.value");
            if (!valor) {
              continue;
            }

            const copia = etiqueta.cloneNode(true) as HTMLElement;
            copia.querySelector("span.value")?.remove();
            const nombreCampo = (copia.textContent ?? "")
              .trim()
              .replace(/\s+/g, " ")
              .replace(/:+$/, "");
            campos[nombreCampo] = valor.textContent?.trim() ?? "";
          }

          return { titulo, campos };
        })
        .filter(({ campos }) => Object.keys(campos).length > 0),
    );
  }

  async obtenerBeneficiario() {
    await this.ClickPestanaInformacionGeneral();
    const campos = await this.obtenerCamposPorSelector(CAMPOS_BENEFICIARIO);
    campos.relacion = await this.texto(this.page.locator("#NombreCompleto"));
    return campos;
  }

  async obtenerRespuestasCoberturas() {
    await this.ClickPestanaCoberturasDeSeguros();
    const respuestas: Record<string, string> = {};

    for (let numero = 1; numero <= 6; numero++) {
      const pregunta = this.page.locator(`#PreguntaCoberturas${numero}`);
      await expect(pregunta).toBeAttached();
      const contenedor = pregunta.locator("xpath=..");
      respuestas[`Pregunta ${numero}`] =
        (await contenedor.locator("tbody tr").count()) > 0 ? "Si" : "No";
    }

    return respuestas;
  }

  async obtenerRespuestasCuestionario() {
    await this.ClickPestanaCuestionario();
    await this.page.locator("#CuestinarioSeccion1").click();
    const respuestas: Record<string, string> = {};

    for (let numero = 1; numero <= 18; numero++) {
      const letra = String.fromCharCode(64 + numero);
      const pregunta = this.page.locator(`#CuestinarioSeccion1_${letra}`);
      await expect(pregunta).toBeAttached();
      const contenedor = pregunta.locator("xpath=..");
      const sinResultados =
        (await contenedor.locator(".labelTextoSinResultados").count()) > 0;
      respuestas[`Pregunta ${letra}`] = sinResultados ? "No" : "Si";
    }

    return respuestas;
  }

  async obtenerPlanYFrecuencia() {
    await this.ClickPestanaPlanyFrecuenciaPago();
    return {
      plan: await this.texto(this.page.locator("#PlanFP")),
      redProveedores: await this.texto(
        this.page.locator("#RedProvedoresFP"),
      ),
      deducible: await this.texto(this.page.locator("#DeducibleFP")),
      frecuenciaPago: await this.texto(
        this.page.locator("#FrecuenciaPagoFP"),
      ),
    };
  }

  async obtenerIdioma() {
    await this.ClickPestanaIdioma();
    return this.texto(this.page.locator("#TextIdiomaSeleccionado"));
  }

  async obtenerSolicitantesLimitaciones() {
    await this.ClickPestanaLimitaciones();
    const solicitantes = this.page.locator("#Exclusiones a");
    await expect(solicitantes.first()).toBeVisible({ timeout: 15000 });
    return solicitantes
      .evaluateAll((elementos) =>
        elementos
          .map((elemento) =>
            (elemento.textContent ?? "").trim().replace(/\s+/g, " "),
          )
          .filter((texto) => /\(.+\)/.test(texto)),
      );
  }

  async obtenerDocumentosContrato() {
    await this.ClickPestanaContrato();
    const documentos = this.page.locator("#Contrato a[id]");
    await expect(documentos.first()).toBeVisible({ timeout: 15000 });
    return documentos
      .evaluateAll((elementos) =>
        elementos
          .map((elemento) =>
            (elemento.textContent ?? "").trim().replace(/\s+/g, " "),
          )
          .filter(Boolean),
      );
  }
}
