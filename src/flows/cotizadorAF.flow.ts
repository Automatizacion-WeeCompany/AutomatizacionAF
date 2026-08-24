import { Page, expect } from "@playwright/test";
import { InicioSesionAFPage } from "../paginas/inicioSesionAFPage";
import { HomeAFPage } from "../paginas/homeAFPage";
import { CotizacionesPropuestasAFPage } from "../paginas/1cotizacionesPropuestasAFPage";
import { InicioCotizacionDatosPersonalesAFPage } from "../paginas/2inicioCotizacionDatosPersonalesAFPage";
import { OpcionPaisResidencia } from "../types/ValidacionTarifas";
import { SeleccionarPlanesAFPage } from "../paginas/3seleccionPlanesAFPage";
import { ResumenCotizacionPage } from "../paginas/4resumenCotizacionPage";
import { ResumenPlanesCotizadosPage } from "../paginas/5resumenCotizacionPage";
import { InformacionPersonalPage } from "../paginas/6informacionPersonalPage";
import { CuestionarioMedicoPt1Page } from "../paginas/7cuestionarioMedicoPt1Page";
import {
  validarPantallaPorIdioma,
  Idioma,
  obtenerOpcionPorIdioma,
} from "src/utilidades/validacionIdiomas";
import { EscenarioExcel, ObjetivoBMI } from "../types/EscenarioExcel";
import { CuestionarioMedicoPt2Page } from "@pages/8cuestionarioMedicoPt2Page";
import { ConfirmacionDePlanYPagoPage } from "../paginas/9confirmacionDePlanyPagoPage";
import { TerminosyCondicionesPage } from "@pages/10terminosyCondicionesPage";
import { DeclaracionPage } from "@pages/11declaracionPage";
import { ApliacionCompletaPage } from "@pages/12apliacionCompletaPage";
import { RegistrarInformacionPagoPage } from "@pages/13registrarInformacionPagoPage";
import {
  ConfirmacionPagoPage,
  DatosTarjetaPago,
  MetodoPagoPage,
  ModalSecureCheckoutPage,
} from "@pages/14metodoPagoPage";
import { agregarPersonaPT2Page } from "@pages/agregarPersonaPT2Page";
import { registrarInfo } from "../utilidades/LoggerPruebas";
import {
  DATOS_ANTROPOMETRICOS_RECHAZO_BMI,
  obtenerDatosAntropometricosSeguros,
} from "../utilidades/DatosAntropometricosPrueba";

const CONFIGURACION_IDIOMAS: Record<
  Idioma,
  { opcion: string; textoConfirmacion: string }
> = {
  Esp: { opcion: "ESP", textoConfirmacion: "Bienvenido" },
  Eng: { opcion: "ENG", textoConfirmacion: "Welcome" },
  Port: { opcion: "PORT", textoConfirmacion: "Bem-vindo" },
};

type RespuestaBinaria = "Si" | "No";

function normalizarRespuestaBinaria(
  valor: string,
  nombreColumna: string,
): RespuestaBinaria {
  const valorNormalizado = String(valor ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (valorNormalizado === "si") {
    return "Si";
  }
  if (valorNormalizado === "no") {
    return "No";
  }

  throw new Error(
    `${nombreColumna} debe contener Si o No. Valor recibido: "${valor}"`,
  );
}

export class InicioSesionAFFlow {
  inicioSesionAFPage: InicioSesionAFPage;

  constructor(private readonly page: Page) {
    this.inicioSesionAFPage = new InicioSesionAFPage(this.page);
  }

  async paginaInicio(Liga: string) {
    await this.page.goto(Liga);
  }

  async iniciarSesionAF(
    IdiomaCotizacion: string,
    CorreoInicio: string,
    Contrasena: string,
  ) {
    const idioma = IdiomaCotizacion as Idioma;
    const configuracionIdioma = CONFIGURACION_IDIOMAS[idioma];

    if (!configuracionIdioma) {
      throw new Error("Idioma no soportado revisar archivo de datos");
    }

    await this.inicioSesionAFPage.clickBtnCambioIdioma();
    await this.page
      .locator("a.dropdown-item-lang", { hasText: configuracionIdioma.opcion })
      .click();
    await expect(
      this.page.getByText(configuracionIdioma.textoConfirmacion, { exact: true }).first(),
    ).toBeVisible();
    registrarInfo(
      `Idioma cambiado correctamente, texto visible: ${configuracionIdioma.textoConfirmacion}`,
    );
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "InicioSesion",
      idioma,
    });

    await this.inicioSesionAFPage.ingresaCorreo(CorreoInicio);
    await this.inicioSesionAFPage.ingresaContrasena(Contrasena);
    await this.inicioSesionAFPage.clickBtnIniciarSesion();
    await expect(this.page).toHaveURL(
      "https://weeqp.azurewebsites.net/AF/Broker/Home",
    );
  }
}

export class HomeAFFlow {
  homeAFPage: HomeAFPage;

  constructor(private readonly page: Page) {
    this.homeAFPage = new HomeAFPage(this.page);
  }

  async homeAF(IdiomaCotizacion: string) {
    await this.homeAFPage.clickBtnCotizacion();
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "Cotizaciones",
      idioma: IdiomaCotizacion as Idioma,
    });
  }
}

export class IniciarCotizacionFlow {
  iniciarCotizacionPage: CotizacionesPropuestasAFPage;

  constructor(private readonly page: Page) {
    this.iniciarCotizacionPage = new CotizacionesPropuestasAFPage(this.page);
  }

  async iniciarCotizacion(IdiomaCotizacion: string) {
    await this.iniciarCotizacionPage.clickBtnNuevaCotizacion();
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "PropuestaCotizacion",
      idioma: IdiomaCotizacion as Idioma,
    });
  }
}

export class PasoUnoDatosPersonalesFlow {
  CapturaDatosPersonalesPage: InicioCotizacionDatosPersonalesAFPage;
  constructor(private readonly page: Page) {
    this.CapturaDatosPersonalesPage = new InicioCotizacionDatosPersonalesAFPage(
      this.page,
    );
  }
  async CapturaDatosPersonales(
    TipoPoliza: string,
    ConyugePareja: string | undefined,
    HijosMenoresDe24: string,
    paisResidencia?: OpcionPaisResidencia,
  ) {
    await this.CapturaDatosPersonalesPage.ingresaNombretitular();
    await this.CapturaDatosPersonalesPage.ingresaApellidoTitular();
    const edadTitular =
      await this.CapturaDatosPersonalesPage.ingresaEdadTitular();
    const paisSeleccionado =
      await this.CapturaDatosPersonalesPage.seleccionaPaisRecidenciaTitular(
        paisResidencia,
      );

    let edadConyuge: number | undefined;
    switch (TipoPoliza) {
      case "Familiar":
        await this.CapturaDatosPersonalesPage.seleccionaTipoPolizaFamiliar();
        if (ConyugePareja === "Si") {
          await this.CapturaDatosPersonalesPage.checkConyugeParejaSi();
        } else if (ConyugePareja === "No") {
          await this.CapturaDatosPersonalesPage.checkConyugeParejaNo();
        } else {
          throw new Error(
            "ConyugePareja debe ser Si o No para una póliza Familiar",
          );
        }
        if (!HijosMenoresDe24) {
          throw new Error(
            "HijosMenoresDe24 es obligatorio para una póliza Familiar",
          );
        }
        edadConyuge =
          await this.CapturaDatosPersonalesPage.ingresaEdadDependiente();
        await this.CapturaDatosPersonalesPage.seleccionaNumeroHijosMenoresDe24(
          HijosMenoresDe24,
        );
        break;
      case "Individual":
        await this.CapturaDatosPersonalesPage.seleccionaTipoPolizaIndividual();
        break;
      default:
        throw new Error(
          `Tipo de póliza no soportado: ${TipoPoliza}. Use Familiar o Individual`,
        );
    }

    await this.CapturaDatosPersonalesPage.clickBtnContinuar();
    return { edadTitular, edadConyuge, paisSeleccionado };
  }
}

export class PasoDosPlanesFlow {
  seleccionarPlanesPage: SeleccionarPlanesAFPage;
  constructor(private readonly page: Page) {
    this.seleccionarPlanesPage = new SeleccionarPlanesAFPage(this.page);
  }
  async seleccionarPlanes(
    IdiomaCotizacion: string,
    CotizarPlan: string,
    RedProveedores: string,
    Deducible: string,
    FrecuenciaPago: string,
  ) {
    const idioma = IdiomaCotizacion as Idioma;
    const redProveedoresVisible =
      RedProveedores === "Sin cobertura dentro de EE. UU."
        ? obtenerOpcionPorIdioma(
            "RedProveedores",
            RedProveedores,
            idioma,
          )
        : RedProveedores;

    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "SeleccionarPlanes",
      idioma,
    });
    switch (CotizarPlan) {
      case "Superior":
        await this.seleccionarPlanesPage.seleccionarPlanSuperior();
        if (RedProveedores === "Ultra") {
          await this.seleccionarPlanesPage.seleccionaRedProveedoresUltra();
        } else if (RedProveedores === "Open") {
          await this.seleccionarPlanesPage.seleccionaRedProveedoresOpen();
        } else {
          throw new Error(
            "Red de proveedores no soportada revisar archivo de datos",
          );
        }
        break;
      case "Optima":
        await this.seleccionarPlanesPage.seleccionarPlanOptima();
        if (RedProveedores === "Ultra") {
          await this.seleccionarPlanesPage.seleccionaRedProveedoresUltra();
        } else if (RedProveedores === "Plus") {
          await this.seleccionarPlanesPage.seleccionaRedProveedoresPlus();
        } else {
          throw new Error(
            "Red de proveedores no soportada revisar archivo de datos",
          );
        }
        break;
      case "Vital":
        await this.seleccionarPlanesPage.seleccionarPlanVital();
        if (RedProveedores === "Plus") {
          await this.seleccionarPlanesPage.seleccionaRedProveedoresPlus();
        } else if (RedProveedores === "Core") {
          await this.seleccionarPlanesPage.seleccionaRedProveedoresCore();
        } else {
          throw new Error(
            "Red de proveedores no soportada revisar archivo de datos",
          );
        }
        break;
      case "Protect":
        await this.seleccionarPlanesPage.seleccionarPlanProtect();
        if (RedProveedores === "Sin cobertura dentro de EE. UU.") {
          await this.seleccionarPlanesPage.seleccionaRedProveedoresSinCoberturaEEUU(
            redProveedoresVisible,
          );
        } else if (RedProveedores === "Core") {
          await this.seleccionarPlanesPage.seleccionaRedProveedoresCore();
        } else {
          throw new Error(
            "Red de proveedores no soportada revisar archivo de datos",
          );
        }
        break;
      default:
        throw new Error("Plan no soportado revisar archivo de datos");
    }
    await this.seleccionarPlanesPage.seleccionaDeducible(Deducible);
    switch (FrecuenciaPago) {
      case "Mensual":
        await this.seleccionarPlanesPage.seleccionaFrecuanciaPagoMensual();
        break;
      case "Trimestral":
        await this.seleccionarPlanesPage.seleccionaFrecuanciaTrimestral();
        break;
      case "Semestral":
        await this.seleccionarPlanesPage.seleccionaFrecuanciaSemestral();
        break;
      case "Anual":
        await this.seleccionarPlanesPage.seleccionaFrecuanciaAnual();
        break;
      default:
        throw new Error(
          "Frecuencia de pago no soportada revisar archivo de datos",
        );
    }
    await this.seleccionarPlanesPage.asegurarConfiguracionPlan(
      redProveedoresVisible,
      Deducible,
    );
    await this.seleccionarPlanesPage.clickBtnContinuar();
  }
}

export class PasoTresCotizacionFlow {
  resumenCotizacionPage: ResumenCotizacionPage;
  constructor(private readonly page: Page) {
    this.resumenCotizacionPage = new ResumenCotizacionPage(this.page);
  }

  async resumenCotizacion(
    IdiomaCotizacion: string,
    validarTarifaAplicable = false,
  ) {
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "ResumenCotizacion",
      idioma: IdiomaCotizacion as Idioma,
    });
    const tarifaAplicable = validarTarifaAplicable
      ? await this.resumenCotizacionPage.obtenerTarifaAplicable()
      : undefined;
    await this.resumenCotizacionPage.ClickBtnContinuar();
    return tarifaAplicable;
  }
}

export class PasoCuatroResumenCotizacionFlow {
  resumenPlanesCotizadosPage: ResumenPlanesCotizadosPage;
  constructor(private readonly page: Page) {
    this.resumenPlanesCotizadosPage = new ResumenPlanesCotizadosPage(this.page);
  }

  async resumenPlanesCot(IdiomaCotizacion: string) {
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "ResumenPlanesCotizados",
      idioma: IdiomaCotizacion as Idioma,
    });
    await this.resumenPlanesCotizadosPage.ClickBtnAplicarAhora();
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "ResumenPlanesCotizadosModal",
      idioma: IdiomaCotizacion as Idioma,
    });
    await this.resumenPlanesCotizadosPage.ClickBtnContestarFormularioAhoraModal();
  }
}

export class PasoCincoInformacionPersonalFlow {
  informacionPersonalPage: InformacionPersonalPage;
  constructor(private readonly page: Page) {
    this.informacionPersonalPage = new InformacionPersonalPage(this.page);
  }

  async informacionPersonal(
    escenario: EscenarioExcel,
    edadTitular: number,
    numeroFlujo: number,
    edadConyuge?: number,
  ) {
    const {
      IdiomaCotizacion,
      SexoAlNacer,
      EstadoCivil,
      TelefonoSecundario,
      EliminarTelSec,
      OcupacionTitular,
      TipoIdentificacionTitular,
      DireccionCorrespondencia,
      EliminarDirCorr,
      Hijo1,
      Hijo2,
      Hijo3,
      Hijo4,
      Hijo5,
      SexoDependiente1,
      SexoDependiente2,
      SexoDependiente3,
      SexoDependiente4,
      SexoDependiente5,
      RelacionSolicitantePrimario,
    } = escenario;
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "InformacionPersonal",
      idioma: IdiomaCotizacion as Idioma,
    });
    await this.informacionPersonalPage.IngresaSegundoNombre(numeroFlujo);
    await this.informacionPersonalPage.SeleccionaPaisNacimiento();
    const datosAntropometricos =
      escenario.ObjetivoBMI === "Titular"
        ? DATOS_ANTROPOMETRICOS_RECHAZO_BMI
        : obtenerDatosAntropometricosSeguros(edadTitular);
    await this.informacionPersonalPage.IngresaEstatura(
      datosAntropometricos?.estaturaCm,
    );
    await this.informacionPersonalPage.IngresaPeso(
      datosAntropometricos?.pesoKg,
    );
    await this.informacionPersonalPage.SeleccionaPaisTelefono();
    await this.informacionPersonalPage.IngresaNumeroCelular();
    if (TelefonoSecundario === "Si") {
      await this.informacionPersonalPage.ClickBtnTelefonoSecundario();
      await this.informacionPersonalPage.IngresaNumeroCelularSecundario();
    }
    if (EliminarTelSec === "Si") {
      await this.informacionPersonalPage.ClickBtonBasuraTelefonoSecundario();
    }
    await this.informacionPersonalPage.IngresaCorreoTitular();
    await this.informacionPersonalPage.SeleccionaOcupacionTitular(
      obtenerOpcionPorIdioma(
        "OcupacionTitular",
        OcupacionTitular,
        IdiomaCotizacion as Idioma,
      ),
    );
    await this.informacionPersonalPage.SeleccionaPaisCiudadaniaTitular();
    await this.informacionPersonalPage.SeleccionaTipoIdentificacionTitular(
      obtenerOpcionPorIdioma(
        "TipoIdentificacionTitular",
        TipoIdentificacionTitular,
        IdiomaCotizacion as Idioma,
      ),
    );
    await this.informacionPersonalPage.IngresaNumeroIdentificacionTitular();
    await this.informacionPersonalPage.SeleccionaPaisExpedicionIdTitular();
    await this.informacionPersonalPage.AdjuntaArchivoIdTitular();
    await this.informacionPersonalPage.IngresaDireccionResidencial();
    await this.informacionPersonalPage.IngresaCiudadResidencial();
    await this.informacionPersonalPage.SeleccionaEstadoResidencial();
    await this.informacionPersonalPage.IngresaCodigoPostalResidencial();
    if (DireccionCorrespondencia === "Si") {
      await this.informacionPersonalPage.ClickBtnAgregarDireccionDeCorrespondencia();
      await this.informacionPersonalPage.IngresaDireccionDeCorrespondencia();
      await this.informacionPersonalPage.SeleccionaPaisDeCorrespondencia();
      await this.informacionPersonalPage.IngresaCiudadDeCorrespondencia();
      await this.informacionPersonalPage.SeleccionaEstadoDeCorrespondencia();
      await this.informacionPersonalPage.IngresaCodigoPostalDeCorrespondencia();
    }
    if (EliminarDirCorr === "Si") {
      await this.informacionPersonalPage.ClickBtnEliminarDireccionDeCorrespondencia();
    }
    if (escenario.TipoPoliza === "Familiar" && escenario.ConyugePareja === "Si") {
      if (!edadConyuge) {
        throw new Error("No se conservó la edad del cónyuge capturada en la cotización");
      }
      await this.capturarConyuge(
        edadConyuge,
        IdiomaCotizacion as Idioma,
        OcupacionTitular,
        TipoIdentificacionTitular,
      );
    }
    const dependientes = [
      { relacion: Hijo1, sexo: SexoDependiente1 },
      { relacion: Hijo2, sexo: SexoDependiente2 },
      { relacion: Hijo3, sexo: SexoDependiente3 },
      { relacion: Hijo4, sexo: SexoDependiente4 },
      { relacion: Hijo5, sexo: SexoDependiente5 },
    ].filter(({ relacion, sexo }) => relacion || sexo);

    if (escenario.TipoPoliza === "Individual" && dependientes.length > 0) {
      throw new Error(
        "Una póliza Individual no debe incluir hijos ni dependientes en el Excel",
      );
    }
    if (escenario.TipoPoliza === "Familiar") {
      await this.procesarDependientes(dependientes, escenario.ObjetivoBMI);
    }
    //Agrega y valdia informacion del beneficiario
    await this.informacionPersonalPage.ClickBtnAgregarInfoBeneficiario();
    await this.informacionPersonalPage.SeleccionaRelacionSolicitantePrimario(
      obtenerOpcionPorIdioma(
        "RelacionSolicitantePrimario",
        RelacionSolicitantePrimario,
        IdiomaCotizacion as Idioma,
      ),
    );
    await this.informacionPersonalPage.IngresaApellidoBeneficiario();
    await this.informacionPersonalPage.IngresaNombreBeneficiario();
    await this.informacionPersonalPage.IngresaFechaNacimientoBeneficiario();
    await this.informacionPersonalPage.SeleccionaPaisRecidenciaBeneficiario();
    await this.informacionPersonalPage.SeleccionaCiudadaniaBeneficiario();
    await this.informacionPersonalPage.IngresaTelefonoBeneficiario();
    await this.informacionPersonalPage.IngresaCorreoBeneficiario();
    await this.informacionPersonalPage.ClickBtnAgregarBeneficiario();
    await this.capturarDatosDemograficos(
      edadTitular,
      SexoAlNacer,
      EstadoCivil,
    );
    await this.informacionPersonalPage.ClickBtnGuardar();
    await this.informacionPersonalPage.ClickBtnSiguiente();
  }

  private async capturarDatosDemograficos(
    edadTitular: number,
    sexoAlNacer: string,
    estadoCivil: string,
  ) {
    await this.informacionPersonalPage.IngresaFechaNacimiento(edadTitular);

    if (sexoAlNacer === "Masculino") {
      await this.informacionPersonalPage.CheckSexoMasculino();
    } else if (sexoAlNacer === "Femenino") {
      await this.informacionPersonalPage.CheckSexoFemenino();
    } else {
      throw new Error("Sexo al nacer no soportado revisar archivo de datos");
    }

    if (estadoCivil === "Casado(a)") {
      await this.informacionPersonalPage.CheckCasado();
    } else if (estadoCivil === "Soltero(a)") {
      await this.informacionPersonalPage.CheckSoltero();
    } else {
      throw new Error("Estado civil no soportado revisar archivo de datos");
    }
  }

  private async capturarConyuge(
    edadConyuge: number,
    idiomaCotizacion: Idioma,
    ocupacion: string,
    tipoIdentificacion: string,
  ) {
    await this.informacionPersonalPage.ClickBtnAgregarConyuge();
    await this.informacionPersonalPage.ClickCheckConyuge();
    await this.informacionPersonalPage.IngresaApellidoDependiente();
    await this.informacionPersonalPage.IngresaNombreDependiente();
    await this.informacionPersonalPage.IngresaFechaNacimientoConyuge(edadConyuge);
    await this.informacionPersonalPage.ClickCheckSexoNacerDependienteFemenino();
    await this.informacionPersonalPage.ClickCheckEstadoCivilConyuge();
    await this.informacionPersonalPage.SeleccionaPaisNacimientoDependiente();
    const datosAntropometricos = obtenerDatosAntropometricosSeguros(edadConyuge);
    await this.informacionPersonalPage.IngresaEstaturaDependiente(
      datosAntropometricos.estaturaCm,
    );
    await this.informacionPersonalPage.IngresaPesoDependiente(
      datosAntropometricos.pesoKg,
    );
    await this.informacionPersonalPage.IngresaTelefonoConyuge();
    await this.informacionPersonalPage.IngresaCorreoConyuge();
    await this.informacionPersonalPage.SeleccionaOcupacionConyuge(
      obtenerOpcionPorIdioma(
        "OcupacionTitular",
        ocupacion,
        idiomaCotizacion,
      ),
    );
    await this.informacionPersonalPage.SeleccionaCiudadaniaDependiente();
    await this.informacionPersonalPage.SeleccionaPaisResidenciaConyuge();
    if (await this.informacionPersonalPage.EsVisibleIdentificacionConyuge()) {
      await this.informacionPersonalPage.SeleccionaTipoIdentificacionConyuge(
        obtenerOpcionPorIdioma(
          "TipoIdentificacionTitular",
          tipoIdentificacion,
          idiomaCotizacion,
        ),
      );
      await this.informacionPersonalPage.IngresaNumeroIdentificacionConyuge();
      await this.informacionPersonalPage.SeleccionaPaisExpedicionIdConyuge();
    }
    await this.informacionPersonalPage.SeleccionaNoEstudianteConyuge();
    await this.informacionPersonalPage.ClickBtnGuardarHijo();
  }

  private async procesarDependientes(
    dependientes: Array<{
      relacion: string | undefined;
      sexo: string | undefined;
    }>,
    objetivoBMI: ObjetivoBMI,
  ) {
    const hijosValidos = new Set([
      "Hijo Biológico",
      "Hijastro",
      "Hijo Adoptado Legalmente",
      "Menor Bajo Custodia Legal",
    ]);
    const sexosValidos = new Set(["Masculino", "Femenino"]);

    for (let i = 0; i < dependientes.length; i++) {
      const { relacion: hijo, sexo } = dependientes[i];

      if (!hijo || !hijosValidos.has(hijo)) {
        throw new Error(`Beneficiario no soportado: ${hijo}`);
      }

      await this.informacionPersonalPage.ClickBtnAgregarHijo();

      switch (hijo) {
        case "Hijo Biológico":
          await this.informacionPersonalPage.ClickCheckHijoBiologico();
          break;
        case "Hijastro":
          await this.informacionPersonalPage.ClickCheckHijastro();
          break;
        case "Hijo Adoptado Legalmente":
          await this.informacionPersonalPage.ClickCheckHijoAdoptadoLegalmente();
          break;
        case "Menor Bajo Custodia Legal":
          await this.informacionPersonalPage.ClickCheckMenorBajoCustodiaLegal();
          break;
      }

      await this.informacionPersonalPage.IngresaApellidoDependiente();
      await this.informacionPersonalPage.IngresaNombreDependiente();
      const esObjetivoBMI = objetivoBMI === `Dependiente${i + 1}`;
      const edadDependiente = esObjetivoBMI ? 20 : 10;
      await this.informacionPersonalPage.IngresaFechaNacimientoDependiente(
        edadDependiente,
      );
      if (!sexo || !sexosValidos.has(sexo)) {
        throw new Error(
          `Sexo al nacer no soportado o faltante para el dependiente #${i + 1}: ${sexo}`,
        );
      }

      await this.informacionPersonalPage.SeleccionaPaisNacimientoDependiente();
      const datosAntropometricos = esObjetivoBMI
        ? DATOS_ANTROPOMETRICOS_RECHAZO_BMI
        : obtenerDatosAntropometricosSeguros(edadDependiente);
      await this.informacionPersonalPage.IngresaEstaturaDependiente(
        datosAntropometricos?.estaturaCm,
      );
      await this.informacionPersonalPage.IngresaPesoDependiente(
        datosAntropometricos?.pesoKg,
      );
      await this.informacionPersonalPage.SeleccionaCiudadaniaDependiente();
      // Los selects de país vuelven a renderizar parte del modal y pueden
      // limpiar el sexo; se selecciona al final para asegurar su persistencia.
      switch (sexo) {
        case "Masculino":
          await this.informacionPersonalPage.ClickCheckSexoNacerDependienteMasculino();
          break;
        case "Femenino":
          await this.informacionPersonalPage.ClickCheckSexoNacerDependienteFemenino();
          break;
      }
      if (esObjetivoBMI) {
        await this.informacionPersonalPage.SeleccionaSiEstudianteDependiente();
      }
      await this.informacionPersonalPage.ClickBtnGuardarHijo();
    }
  }
}

export class PasoSeisCuestionarioMedicoFlow {
  private readonly cuestionarioMedicoPt1Page: CuestionarioMedicoPt1Page;
  constructor(page: Page) {
    this.cuestionarioMedicoPt1Page = new CuestionarioMedicoPt1Page(page);
  }

  async CapturarCuestionarioMedicoP1(
    IdiomaCotizacion: string,
    CapturaCuestionarioMedico: string,
    P5Sustancia: string,
    SigueIngiriendo: string,
  ) {
    const respuestaCuestionario = normalizarRespuestaBinaria(
      CapturaCuestionarioMedico,
      "CuestionarioMedicoCaptura",
    );
    registrarInfo(`Cuestionario médico I configurado en: ${respuestaCuestionario}`);

    if (respuestaCuestionario === "No") {
      await this.capturarRespuestasNegativas();
    } else {
      await this.capturarRespuestasAfirmativas(
        IdiomaCotizacion,
        P5Sustancia,
        SigueIngiriendo,
      );
    }

    await this.cuestionarioMedicoPt1Page.ClickBtnSiguiente();
  }

  private async capturarRespuestasNegativas() {
    await this.cuestionarioMedicoPt1Page.CheckNoP1();
    await this.cuestionarioMedicoPt1Page.CheckNoP2();
    await this.cuestionarioMedicoPt1Page.CheckNoP3();
    await this.cuestionarioMedicoPt1Page.CheckNoP4();
    await this.cuestionarioMedicoPt1Page.CheckNoP5();
    await this.cuestionarioMedicoPt1Page.CheckNoP6();
  }

  private async capturarRespuestasAfirmativas(
    idiomaCotizacion: string,
    sustancia: string,
    sigueIngiriendo: string,
  ) {
    await this.cuestionarioMedicoPt1Page.CheckSiP1();
    await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP1();
    await this.cuestionarioMedicoPt1Page.SeleccionaPersonaAfectadaP1();
    await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP1();

    await this.cuestionarioMedicoPt1Page.CheckSiP2();
    await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAleatoriaP2();
    await this.cuestionarioMedicoPt1Page.SubirArchivoFirmaP2();
    await this.cuestionarioMedicoPt1Page.SubirArchivoReciboP2();
    await this.cuestionarioMedicoPt1Page.ClickBtnGuardarP2();

    await this.cuestionarioMedicoPt1Page.CheckSiP3();
    await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAleatoriaP3();
    await this.cuestionarioMedicoPt1Page.IngresarDetallesP3();
    await this.cuestionarioMedicoPt1Page.ClickBtnGuardarP3();

    await this.cuestionarioMedicoPt1Page.CheckSiP4();
    await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP4();
    await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAfectadaP4();
    await this.cuestionarioMedicoPt1Page.IngresarDetallesP4();
    await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP4();

    await this.cuestionarioMedicoPt1Page.CheckSiP5();
    await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP5();
    await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAfectadaP5();
    await this.cuestionarioMedicoPt1Page.IngresarDetallesP5();
    await this.cuestionarioMedicoPt1Page.SeleccionarsustanciaP5(
      obtenerOpcionPorIdioma(
        "Sustancia",
        sustancia,
        idiomaCotizacion as Idioma,
      ),
    );
    const respuestaIngesta = normalizarRespuestaBinaria(
      sigueIngiriendo,
      "SigueIngiriendo",
    );
    if (respuestaIngesta === "Si") {
      await this.cuestionarioMedicoPt1Page.checkIngiriendoSi();
    } else {
      await this.cuestionarioMedicoPt1Page.checkIngiriendoNo();
    }
    await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP5();

    await this.cuestionarioMedicoPt1Page.CheckSiP6();
    await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAleatoriaP6();
    await this.cuestionarioMedicoPt1Page.ClickbtnAgregarEspecialistaP6();
    await this.cuestionarioMedicoPt1Page.IngresarNombreMedicoTratante();
    await this.cuestionarioMedicoPt1Page.IngresaNumeroTelefonoMedicoTratante();
    await this.cuestionarioMedicoPt1Page.SeleccionarEspecialidadMedicoTratante();
    await this.cuestionarioMedicoPt1Page.IngresaMotivoConsultaMedicoTratante();
    await this.cuestionarioMedicoPt1Page.IngresaFechaConsultaMedicoTratante();
    await this.cuestionarioMedicoPt1Page.IngresaDescripcionMedicoTratante();
    await this.cuestionarioMedicoPt1Page.ClickBtnGuardarMedicoTratante();
  }
}

export class PasoSieteCuestionarioMedicoFlow {
  private readonly cuestionarioMedicoPt2Page: CuestionarioMedicoPt2Page;
  private readonly agregarPersonaPT2Page: agregarPersonaPT2Page;

  constructor(private readonly page: Page) {
    this.cuestionarioMedicoPt2Page = new CuestionarioMedicoPt2Page(page);
    this.agregarPersonaPT2Page = new agregarPersonaPT2Page(page);
  }

  private async avanzarDespuesDelCuestionario() {
    await this.cuestionarioMedicoPt2Page.ClickBtnSiguiente();
    const destino =
      await this.cuestionarioMedicoPt2Page.esperarDestinoDespuesDelCuestionario();

    if (destino === "SeccionAdicional") {
      registrarInfo("Sección 2 del cuestionario médico detectada");
      await this.cuestionarioMedicoPt2Page.ClickCheckNoPA2();
      await this.cuestionarioMedicoPt2Page.ClickCheckNoPB2();
      await this.cuestionarioMedicoPt2Page.ClickCheckNoPC2();
      await this.cuestionarioMedicoPt2Page.ClickBtnSiguienteSeccion2();
    } else {
      registrarInfo("Esta ejecución NO incluye la sección 2 del cuestionario");
    }
  }

  async CapturarCuestionarioMedicoP2(
    IdiomaCotizacion: string,
    CapturaCuestionarioMedico: string,
  ) {
    const respuestaCuestionario = normalizarRespuestaBinaria(
      CapturaCuestionarioMedico,
      "CapturaPreguntasPt2",
    );
    registrarInfo(`Cuestionario médico II configurado en: ${respuestaCuestionario}`);

    if (respuestaCuestionario === "Si") {
      registrarInfo(
        "El modo afirmativo binario usa la pregunta A como caso UW dirigido; no selecciona diagnósticos críticos al azar",
      );
      await this.cuestionarioMedicoPt2Page.CheckSiPA();
      await this.cuestionarioMedicoPt2Page.CheckSiPAAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPA();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPA();
      await this.agregarPersonaPT2Page.SiTipoTumorCancerPA();
      await this.agregarPersonaPT2Page.NoCheckQuimioRadioPA();
      await this.agregarPersonaPT2Page.BtnAgregarPA();
      await this.cuestionarioMedicoPt2Page.SeleccionarTodasLasRespuestasNo([1]);
      await this.avanzarDespuesDelCuestionario();
      return;
    }

    await this.cuestionarioMedicoPt2Page.SeleccionarTodasLasRespuestasNo();
    await this.avanzarDespuesDelCuestionario();
  }
}

export class PasoOchoConfirmacionDePlanYPagoFlow {
  private readonly confirmacionDePlanYPagoPage: ConfirmacionDePlanYPagoPage;
  constructor(private readonly page: Page) {
    this.confirmacionDePlanYPagoPage = new ConfirmacionDePlanYPagoPage(page);
  }

  async CapturarConfirmacionDePlanYPago() {
    await this.confirmacionDePlanYPagoPage.ClickBtnSiguienteConfirmacionDePlanYPago();
  }
}

export class PasoNueveTerminosyCondicionesFlow {
  private readonly terminosyCondicionesPage: TerminosyCondicionesPage;
  constructor(private readonly page: Page) {
    this.terminosyCondicionesPage = new TerminosyCondicionesPage(page);
  }

  async CapturarTerminosyCondiciones() {
    await this.terminosyCondicionesPage.ClickBtnAceptarTerminosyCondiciones();
    await this.terminosyCondicionesPage.ClickBtnSiguienteTerminosyCondiciones();
  }
}

export class PasoDiezDeclaracionFlow {
  private readonly declaracionPage: DeclaracionPage;
  constructor(private readonly page: Page) {
    this.declaracionPage = new DeclaracionPage(page);
  }

  async CapturarDeclaracion() {
    await this.declaracionPage.ClickBtnAceptaryFirmar();
    await this.declaracionPage.ClickBtnContinuarModal();
    await this.declaracionPage.clickBtnSubirFirma();
    await this.declaracionPage.SubirArchivoFirma();
    await this.declaracionPage.ClickBtnGuardarFirmas();
    await this.declaracionPage.ClickBtnGuardarDeclaracion();
    await this.declaracionPage.ClickBtnSiguienteDeclaracion();
    await this.declaracionPage.ClickBtnFirmaConsultor();
    await this.declaracionPage.ClickBtnSubirFirmaConsultor();
    await this.declaracionPage.SubirArchivoFirmaConsultor();
    await this.declaracionPage.ClickBtnFirmarConsultor();
    await this.declaracionPage.ClickBtnSiguienteDeclaracion();
  }
}

export class PasoOnceAplicacionCompletaFlow {
  private readonly aplicacionCompletaPage: ApliacionCompletaPage;

  constructor(page: Page) {
    this.aplicacionCompletaPage = new ApliacionCompletaPage(page);
  }

  async CapturarAplicacionCompleta() {
    await this.aplicacionCompletaPage.clicBtnPagarAhora();
  }

  async ValidarAplicacionEnEvaluacion(idioma: Idioma) {
    return this.aplicacionCompletaPage.validarCotizacionEnEvaluacion(idioma);
  }

  async ValidarDisponibleParaPagoSinBMI(idioma: Idioma) {
    await this.aplicacionCompletaPage.validarDisponibleParaPagoSinBMI(idioma);
  }
}

export class PasoDoceRegistrarInformacionPagoFlow {
  private readonly registrarInformacionPagoPage: RegistrarInformacionPagoPage;

  constructor(page: Page) {
    this.registrarInformacionPagoPage = new RegistrarInformacionPagoPage(page);
  }

  async CapturarInformacionPago() {
    await this.registrarInformacionPagoPage.checkSiPersonaQuePaga();
    await this.registrarInformacionPagoPage.clickBtnContinuar();
  }
}

const DATOS_PAGO_SANDBOX: DatosTarjetaPago = {
  correo: process.env.AF_PAYMENT_EMAIL || "qa.payment@yopmail.com",
  telefono: process.env.AF_PAYMENT_PHONE || "5555550100",
  numeroTarjeta: process.env.AF_PAYMENT_CARD || "4111111111111111",
  mesExpiracion: process.env.AF_PAYMENT_EXPIRY_MONTH || "12",
  anioExpiracion:
    process.env.AF_PAYMENT_EXPIRY_YEAR || String(new Date().getFullYear() + 4),
  codigoSeguridad: process.env.AF_PAYMENT_CVV || "123",
  nombre: process.env.AF_PAYMENT_FIRST_NAME || "QA",
  apellido: process.env.AF_PAYMENT_LAST_NAME || "Automation",
  pais: process.env.AF_PAYMENT_COUNTRY || "US",
  direccion: process.env.AF_PAYMENT_ADDRESS || "1 Market Street",
  ciudad: process.env.AF_PAYMENT_CITY || "San Francisco",
  estado: process.env.AF_PAYMENT_STATE || "CA",
  codigoPostal: process.env.AF_PAYMENT_POSTAL_CODE || "94105",
};

export class PasoTreceMetodoPagoFlow {
  private readonly metodoPagoPage: MetodoPagoPage;
  private readonly modalSecureCheckoutPage: ModalSecureCheckoutPage;
  private readonly confirmacionPagoPage: ConfirmacionPagoPage;

  constructor(page: Page) {
    this.metodoPagoPage = new MetodoPagoPage(page);
    this.modalSecureCheckoutPage = new ModalSecureCheckoutPage(page);
    this.confirmacionPagoPage = new ConfirmacionPagoPage(page);
  }

  async CapturarMetodoPago(
    IdiomaCotizacion: string,
    datosPago: DatosTarjetaPago = DATOS_PAGO_SANDBOX,
  ) {
    const idioma = IdiomaCotizacion as Idioma;

    await this.metodoPagoPage.clickBtnTarjetaDeCredito();
    await this.modalSecureCheckoutPage.IngresaCorreoElectronico(datosPago.correo);
    await this.modalSecureCheckoutPage.IngresaNumeroTelefonico(datosPago.telefono);
    await this.modalSecureCheckoutPage.ClickBtnContinuar();
    await this.modalSecureCheckoutPage.IngresaDatosTarjeta(datosPago);
    await this.modalSecureCheckoutPage.ClickBtnContinuarDatosTarjeta();
    await this.modalSecureCheckoutPage.ClickBtnConfirmarYContinuar();
    await this.modalSecureCheckoutPage.ClickBtnContinuarConfirmacionPago();

    const confirmacion = await this.confirmacionPagoPage.validarConfirmacion(idioma);
    registrarInfo(
      `Pago confirmado para ${confirmacion.nombreTitular}. Póliza: ${confirmacion.numeroPoliza}`,
    );
    return confirmacion;
  }
}
