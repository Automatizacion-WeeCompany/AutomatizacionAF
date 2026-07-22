import { Page, expect } from "@playwright/test";
import { InicioSesionAFPage } from "../paginas/inicioSesionAFPage";
import { HomeAFPage } from "../paginas/homeAFPage";
import { CotizacionesPropuestasAFPage } from "../paginas/1cotizacionesPropuestasAFPage";
import { InicioCotizacionDatosPersonalesAFPage } from "../paginas/2inicioCotizacionDatosPersonalesAFPage";
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
import { EscenarioExcel } from "../types/EscenarioExcel";
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

const CONFIGURACION_IDIOMAS: Record<
  Idioma,
  { opcion: string; textoConfirmacion: string }
> = {
  Esp: { opcion: "ESP", textoConfirmacion: "Bienvenido" },
  Eng: { opcion: "ENG", textoConfirmacion: "Welcome" },
  Port: { opcion: "PORT", textoConfirmacion: "Bem-vindo" },
};

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
    console.log(
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
    ConyugePareja: string,
    HijosMenoresDe24: string,
  ) {
    await this.CapturaDatosPersonalesPage.ingresaNombretitular();
    await this.CapturaDatosPersonalesPage.ingresaApellidoTitular();
    await this.CapturaDatosPersonalesPage.ingresaEdadTitular();
    await this.CapturaDatosPersonalesPage.seleccionaPaisRecidenciaTitular();
    if (TipoPoliza === "Familiar") {
      await this.CapturaDatosPersonalesPage.seleccionaTipoPolizaFamiliar();
      if (ConyugePareja === "Si") {
        await this.CapturaDatosPersonalesPage.checkConyugeParejaSi();
      }
      if (ConyugePareja === "No") {
        await this.CapturaDatosPersonalesPage.checkConyugeParejaNo();
      }
      await this.CapturaDatosPersonalesPage.ingresaEdadDependiente();
      await this.CapturaDatosPersonalesPage.seleccionaNumeroHijosMenoresDe24(
        HijosMenoresDe24,
      );
    }
    await this.CapturaDatosPersonalesPage.clickBtnContinuar();
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
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "SeleccionarPlanes",
      idioma: IdiomaCotizacion as Idioma,
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
      RedProveedores,
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

  async resumenCotizacion(IdiomaCotizacion: string) {
    await validarPantallaPorIdioma({
      page: this.page,
      pantalla: "ResumenCotizacion",
      idioma: IdiomaCotizacion as Idioma,
    });
    await this.resumenCotizacionPage.ClickBtnContinuar();
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

  async informacionPersonal(escenario: EscenarioExcel) {
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
    await this.informacionPersonalPage.IngresaSegundoNombre();
    await this.informacionPersonalPage.IngresaFechaNacimiento();
    switch (SexoAlNacer) {
      case "Masculino":
        await this.informacionPersonalPage.CheckSexoMasculino();
        break;
      case "Femenino":
        await this.informacionPersonalPage.CheckSexoFemenino();
        break;
      default:
        throw new Error("Sexo al nacer no soportado revisar archivo de datos");
    }
    await this.informacionPersonalPage.SeleccionaPaisNacimiento();
    if (EstadoCivil === "Casado(a)") {
      await this.informacionPersonalPage.CheckCasado();
    }
    else if (EstadoCivil === "Soltero(a)") {
      await this.informacionPersonalPage.CheckSoltero();
    } else {
      throw new Error("Estado civil no soportado revisar archivo de datos");
    }
    await this.informacionPersonalPage.IngresaEstatura();
    await this.informacionPersonalPage.IngresaPeso();
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
    //Agreaga y valida la informacion de los beneficiarios y conyuge
    const hijos = [Hijo1, Hijo2, Hijo3, Hijo4, Hijo5].filter(Boolean);
    const sexos = [
      SexoDependiente1,
      SexoDependiente2,
      SexoDependiente3,
      SexoDependiente4,
      SexoDependiente5,
    ].filter(Boolean);
    await this.procesarBeneficiarios(hijos, sexos);
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
    await this.informacionPersonalPage.ClickBtnGuardar();
    await this.informacionPersonalPage.ClickBtnSiguiente();
  }

  private async procesarBeneficiarios(hijos: string[], sexos: string[]) {
    const hijosValidos = new Set([
      "Hijo Biológico",
      "Hijastro",
      "Hijo Adoptado Legalmente",
      "Menor Bajo Custodia Legal",
    ]);
    const sexosValidos = new Set(["Masculino", "Femenino"]);

    for (let i = 0; i < hijos.length; i++) {
      const hijo = hijos[i];
      const sexo = sexos[i]; // alineado con el hijo

      if (!hijosValidos.has(hijo)) {
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
      await this.informacionPersonalPage.IngresaFechaNacimientoDependiente();
      if (!sexo || !sexosValidos.has(sexo)) {
        throw new Error(
          `Sexo al nacer no soportado o faltante para el dependiente #${i + 1}: ${sexo}`,
        );
      }

      await this.informacionPersonalPage.SeleccionaPaisNacimientoDependiente();
      await this.informacionPersonalPage.IngresaEstaturaDependiente();
      await this.informacionPersonalPage.IngresaPesoDependiente();
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
    if (CapturaCuestionarioMedico === "No") {
      await this.cuestionarioMedicoPt1Page.CheckNoP1();
      await this.cuestionarioMedicoPt1Page.CheckNoP2();
      await this.cuestionarioMedicoPt1Page.CheckNoP3();
      await this.cuestionarioMedicoPt1Page.CheckNoP4();
      await this.cuestionarioMedicoPt1Page.CheckNoP5();
      await this.cuestionarioMedicoPt1Page.CheckNoP6();
    }
    if (CapturaCuestionarioMedico === "Si") {
      //Agrega persona pregunta 1
      await this.cuestionarioMedicoPt1Page.CheckSiP1();
      await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP1();
      await this.cuestionarioMedicoPt1Page.SeleccionaPersonaAfectadaP1();
      await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP1();
      //Agrega persona pregunta 2
      await this.cuestionarioMedicoPt1Page.CheckSiP2();
      await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAleatoriaP2();
      await this.cuestionarioMedicoPt1Page.SubirArchivoFirmaP2();
      await this.cuestionarioMedicoPt1Page.ClickBtnGuardarP2();
      //Agrega persona pregunta 3
      await this.cuestionarioMedicoPt1Page.CheckSiP3();
      await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAleatoriaP3();
      await this.cuestionarioMedicoPt1Page.IngresarDetallesP3();
      await this.cuestionarioMedicoPt1Page.ClickBtnGuardarP3();
      //Agrega persona pregunta 4
      await this.cuestionarioMedicoPt1Page.CheckSiP4();
      await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP4();
      await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAfectadaP4();
      await this.cuestionarioMedicoPt1Page.IngresarDetallesP4();
      await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP4();
      //Agregar persona pregunta 5
      await this.cuestionarioMedicoPt1Page.CheckSiP5();
      await this.cuestionarioMedicoPt1Page.ClickBtnAgregarPersonaP5();
      await this.cuestionarioMedicoPt1Page.SeleccionarPersonaAfectadaP5();
      await this.cuestionarioMedicoPt1Page.IngresarDetallesP5();
      await this.cuestionarioMedicoPt1Page.SeleccionarsustanciaP5(
        obtenerOpcionPorIdioma(
          "Sustancia",
          P5Sustancia,
          IdiomaCotizacion as Idioma,
        ),
      );
      if (SigueIngiriendo === "Si") {
        await this.cuestionarioMedicoPt1Page.checkIngiriendoSi();
      } else {
        await this.cuestionarioMedicoPt1Page.checkIngiriendoNo();
      }
      await this.cuestionarioMedicoPt1Page.ClickBtnAgregarP5();
      //Agregar persona pregunta 6
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
    await this.cuestionarioMedicoPt1Page.ClickBtnSiguiente();
  }
}

export class PasoSieteCuestionarioMedicoFlow {
  private readonly cuestionarioMedicoPt2Page: CuestionarioMedicoPt2Page;
  private readonly agregarPersonaPT2Page: agregarPersonaPT2Page;

  constructor(private readonly page: Page) {
    this.cuestionarioMedicoPt2Page = new CuestionarioMedicoPt2Page(page);
    this.agregarPersonaPT2Page = new agregarPersonaPT2Page(page);
  }

  async CapturarCuestionarioMedicoP2(
    IdiomaCotizacion: string,
    CapturaCuestionarioMedico: string,
  ) {
    if (CapturaCuestionarioMedico === "No") {
      await this.cuestionarioMedicoPt2Page.CheckNoPA();
      await this.cuestionarioMedicoPt2Page.CheckNoPB();
      await this.cuestionarioMedicoPt2Page.CheckNoPC();
      await this.cuestionarioMedicoPt2Page.CheckNoPD();
      await this.cuestionarioMedicoPt2Page.CheckNoPE();
      await this.cuestionarioMedicoPt2Page.CheckNoPF();
      await this.cuestionarioMedicoPt2Page.CheckNoPG();
      await this.cuestionarioMedicoPt2Page.CheckNoPH();
      await this.cuestionarioMedicoPt2Page.CheckNoPI();
      await this.cuestionarioMedicoPt2Page.CheckNoPJ();
      await this.cuestionarioMedicoPt2Page.CheckNoPK();
      await this.cuestionarioMedicoPt2Page.CheckNoPL();
      await this.cuestionarioMedicoPt2Page.CheckNoPM();
      await this.cuestionarioMedicoPt2Page.CheckNoPN();
      await this.cuestionarioMedicoPt2Page.CheckNoPO();
      await this.cuestionarioMedicoPt2Page.CheckNoPP();
      await this.cuestionarioMedicoPt2Page.CheckNoPQ();
      await this.cuestionarioMedicoPt2Page.CheckNoPR();
    } else if (CapturaCuestionarioMedico === "Si") {
      await this.cuestionarioMedicoPt2Page.CheckSiPA();
      await this.cuestionarioMedicoPt2Page.CheckSiPAAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPA();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPA();
      await this.agregarPersonaPT2Page.SiTipoTumorCancerPA();
      await this.agregarPersonaPT2Page.NoCheckQuimioRadioPA();
      await this.agregarPersonaPT2Page.BtnAgregarPA();

      await this.cuestionarioMedicoPt2Page.CheckSiPB();
      await this.cuestionarioMedicoPt2Page.CheckSiPBAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPB();
      await this.agregarPersonaPT2Page.SiFechaCirugiaPB();
      await this.agregarPersonaPT2Page.DiagnosticoProceMedPB("diagnostico");
      await this.agregarPersonaPT2Page.NoTratamientoActualPB();
      await this.agregarPersonaPT2Page.CondicionActualPB("condicion");
      await this.agregarPersonaPT2Page.BtnAgregarPB();

      await this.cuestionarioMedicoPt2Page.CheckSiPC();
      await this.cuestionarioMedicoPt2Page.CheckSiPCAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPC();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPC();
      await this.agregarPersonaPT2Page.SiDiagnosticoPC();
      await this.agregarPersonaPT2Page.SiTratamientoMedPC();
      await this.agregarPersonaPT2Page.SiCondicionActPC();
      await this.agregarPersonaPT2Page.BtnAgregarPC();

      await this.cuestionarioMedicoPt2Page.CheckSiPD();
      await this.cuestionarioMedicoPt2Page.CheckSiPDAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPD();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPD();
      await this.agregarPersonaPT2Page.SiSintomasPD();
      await this.agregarPersonaPT2Page.SiTratamientosPD();
      await this.agregarPersonaPT2Page.SiCondicionPD();
      await this.agregarPersonaPT2Page.SiDiagnosticoPD();
      await this.agregarPersonaPT2Page.BtnAgregarPD();

      await this.cuestionarioMedicoPt2Page.CheckSiPE();
      await this.cuestionarioMedicoPt2Page.CheckSiPEAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPE();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPE();
      await this.agregarPersonaPT2Page.SiDiagnosticoPE();
      await this.agregarPersonaPT2Page.SiSintomasPE();
      await this.agregarPersonaPT2Page.SiTratamientosPE();
      await this.agregarPersonaPT2Page.SiCondicionPE();
      await this.agregarPersonaPT2Page.BtnAgregarPE();

      await this.cuestionarioMedicoPt2Page.CheckSiPF();
      await this.cuestionarioMedicoPt2Page.CheckSiPFAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPF();
      await this.agregarPersonaPT2Page.SiDiagnosticoPF();
      await this.agregarPersonaPT2Page.SiTratamientosPF();
      await this.agregarPersonaPT2Page.SiCondicionPF();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPF();
      await this.agregarPersonaPT2Page.BtnAgregarPF();

      await this.cuestionarioMedicoPt2Page.CheckSiPG();
      await this.cuestionarioMedicoPt2Page.CheckSiPGAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPG();
      await this.agregarPersonaPT2Page.SiDiagnosticoPG();
      await this.agregarPersonaPT2Page.SiTratamientosPG();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPG();
      await this.agregarPersonaPT2Page.BtnAgregarPG();

      await this.cuestionarioMedicoPt2Page.CheckSiPH();
      await this.cuestionarioMedicoPt2Page.CheckSiPHAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPH();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPH();
      await this.agregarPersonaPT2Page.SiDiagnosticoPH();
      await this.agregarPersonaPT2Page.SiSintomasPH();
      await this.agregarPersonaPT2Page.SiTratamientosPH();
      await this.agregarPersonaPT2Page.SiCondicionPH();
      await this.agregarPersonaPT2Page.BtnAgregarPH();

      await this.cuestionarioMedicoPt2Page.CheckSiPI();
      await this.cuestionarioMedicoPt2Page.CheckSiPIAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPI();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPI();
      await this.agregarPersonaPT2Page.SiDiagnosticoPI();
      await this.agregarPersonaPT2Page.SiCondicionPI();
      await this.agregarPersonaPT2Page.BtnAgregarPI();

      await this.cuestionarioMedicoPt2Page.CheckSiPJ();
      await this.cuestionarioMedicoPt2Page.CheckSiPJAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPJ();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPJ();
      await this.agregarPersonaPT2Page.SiDiagnosticoPJ();
      await this.agregarPersonaPT2Page.SiAreaAfectadaCuerpoPJ();
      await this.agregarPersonaPT2Page.SiSintomasPJ();
      await this.agregarPersonaPT2Page.SiCheckSecuelaPJ();
      await this.agregarPersonaPT2Page.SiCondicionPJ();
      await this.agregarPersonaPT2Page.BtnAgregarPJ();

      await this.cuestionarioMedicoPt2Page.CheckSiPK();
      await this.cuestionarioMedicoPt2Page.CheckSiPKAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPK();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPK();
      await this.agregarPersonaPT2Page.SiDiagnosticoPK();
      await this.agregarPersonaPT2Page.SiTratamientosPK();
      await this.agregarPersonaPT2Page.SiCondicionPK();
      await this.agregarPersonaPT2Page.SiEstudiosPK();
      await this.agregarPersonaPT2Page.SiFechaEstudiosPK();
      await this.agregarPersonaPT2Page.SiSintomasPK();
      await this.agregarPersonaPT2Page.BtnAgregarPK();

      await this.cuestionarioMedicoPt2Page.CheckSiPL();
      await this.cuestionarioMedicoPt2Page.CheckSiPLAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPL();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPL();
      await this.agregarPersonaPT2Page.SiDiagnosticoPL();
      await this.agregarPersonaPT2Page.SiSintomasPL();
      await this.agregarPersonaPT2Page.SiTratamientosPL();
      await this.agregarPersonaPT2Page.SiCondicionPL();
      await this.agregarPersonaPT2Page.SiEstudiosPL();
      await this.agregarPersonaPT2Page.SiFechaEstudiosPL();
      await this.agregarPersonaPT2Page.BtnAgregarPL();

      await this.cuestionarioMedicoPt2Page.CheckSiPM();
      await this.cuestionarioMedicoPt2Page.CheckSiPMAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPM();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPM();
      await this.agregarPersonaPT2Page.SiDiagnosticoPM();
      await this.agregarPersonaPT2Page.SiTratamientosPM();
      await this.agregarPersonaPT2Page.SiCondicionPM();
      await this.agregarPersonaPT2Page.BtnAgregarPM();

      await this.cuestionarioMedicoPt2Page.CheckSiPN();
      await this.cuestionarioMedicoPt2Page.CheckSiPNAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPN();
      await this.agregarPersonaPT2Page.SiFechaDiagnosticoPN();
      await this.agregarPersonaPT2Page.SiDiagnosticoPN();
      await this.agregarPersonaPT2Page.SiSintomasPN();
      await this.agregarPersonaPT2Page.SiTratamientosPN();
      await this.agregarPersonaPT2Page.SiCondicionPN();
      await this.agregarPersonaPT2Page.SiEstudiosPN();
      await this.agregarPersonaPT2Page.SiFechaEstudiosPN();
      await this.agregarPersonaPT2Page.BtnAgregarPN();

      await this.cuestionarioMedicoPt2Page.CheckSiPO();
      await this.cuestionarioMedicoPt2Page.CheckSiPOAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPO();
      await this.agregarPersonaPT2Page.SiDiagnosticoPO();
      await this.agregarPersonaPT2Page.SiCondicionPO();
      await this.agregarPersonaPT2Page.BtnAgregarPO();

      await this.cuestionarioMedicoPt2Page.CheckSiPP();
      await this.cuestionarioMedicoPt2Page.CheckSiPPAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPP();
      await this.agregarPersonaPT2Page.SiFechaCondActPP();
      await this.agregarPersonaPT2Page.SiDiagnosticoPP();
      await this.agregarPersonaPT2Page.SiSintomasPP();
      await this.agregarPersonaPT2Page.SiTratamientosPP();
      await this.agregarPersonaPT2Page.BtnAgregarPP();

      await this.cuestionarioMedicoPt2Page.CheckSiPQ();
      await this.cuestionarioMedicoPt2Page.CheckSiPQAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPQ();
      await this.agregarPersonaPT2Page.SiTratamientosPQ();
      await this.agregarPersonaPT2Page.SiCausaTratamientoPQ();
      await this.agregarPersonaPT2Page.SiMedicamentoDosisPQ();
      await this.agregarPersonaPT2Page.BtnAgregarPQ();

      await this.cuestionarioMedicoPt2Page.CheckSiPR();
      await this.cuestionarioMedicoPt2Page.CheckSiPRAgregarPersona();
      await this.agregarPersonaPT2Page.SiEligePersonaAfectadaPR();
      await this.agregarPersonaPT2Page.SiSubiPesoPR();
      await this.agregarPersonaPT2Page.SiPesoPR();
      await this.agregarPersonaPT2Page.SiCausaPR();
      await this.agregarPersonaPT2Page.SiRecibiTratamientoPR();
      await this.agregarPersonaPT2Page.SiTratamientoRecibidoPR();
      await this.agregarPersonaPT2Page.BtnAgregarPR();
    }
    await this.cuestionarioMedicoPt2Page.ClickBtnSiguiente();
    //Valida el cuestionatrio Parte II
    const frame = this.page.frameLocator("iframe#ifCotizador");
    // 1️seguramos que el iframe esté cargado
    await frame.locator("body").waitFor({ state: "attached", timeout: 10000 });

    // 2️Detectar la sección opcional mediante un control estable e independiente del idioma
    const botonSiguienteSeccion2 = frame.locator("#GostepFive");
    const pantallaSeccion2Visible = await botonSiguienteSeccion2
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    // 3️Lógica funcional
    if (pantallaSeccion2Visible) {
      console.log("Sección 2 del cuestionario médico detectada");
      await this.cuestionarioMedicoPt2Page.ClickCheckNoPA2();
      await this.cuestionarioMedicoPt2Page.ClickCheckNoPB2();
      await this.cuestionarioMedicoPt2Page.ClickCheckNoPC2();
      await this.cuestionarioMedicoPt2Page.ClickBtnSiguienteSeccion2();
    } else {
      console.log("Esta ejecución NO incluye la sección 2 del cuestionario");
    }
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
    console.log(
      `Pago confirmado para ${confirmacion.nombreTitular}. Póliza: ${confirmacion.numeroPoliza}`,
    );
    return confirmacion;
  }
}
