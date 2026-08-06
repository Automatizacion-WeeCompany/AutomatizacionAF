export type IdiomaCotizacionExcel = "Esp" | "Eng" | "Port";
export type TipoPolizaExcel = "Familiar" | "Individual";
export type ResultadoEsperadoCotizacion = "Emision" | "EvaluacionBMI";
export type ObjetivoBMI =
    | "Ninguno"
    | "Titular"
    | "Dependiente1"
    | "Dependiente2"
    | "Dependiente3"
    | "Dependiente4"
    | "Dependiente5";

export interface EscenarioExcel {
    EscenarioPrueba: string;
    PerfilCotizacion: string;
    ConfiguracionPlan: string;
    Url: string;
    IdiomaCotizacion: IdiomaCotizacionExcel;
    CorreoInicio: string;
    Contrasena: string | number;
    TipoPoliza: TipoPolizaExcel;
    ConyugePareja?: string;
    HijosMenoresDe24?: string | number;
    CotizarPlan: string;
    RedProveedores: string;
    Deducible: string;
    FrecuenciaPago: string;
    ResultadoEsperado: ResultadoEsperadoCotizacion;
    ObjetivoBMI: ObjetivoBMI;

    SexoAlNacer: string;
    EstadoCivil: string;
    TelefonoSecundario: string;
    EliminarTelSec: string;
    OcupacionTitular: string;
    TipoIdentificacionTitular: string;
    DireccionCorrespondencia: string;
    EliminarDirCorr: string;

    Hijo1?: string;
    Hijo2?: string;
    Hijo3?: string;
    Hijo4?: string;
    Hijo5?: string;

    SexoDependiente1?: string;
    SexoDependiente2?: string;
    SexoDependiente3?: string;
    SexoDependiente4?: string;
    SexoDependiente5?: string;

    RelacionSolicitantePrimario: string;
    CuestionarioMedicoCaptura: string;
    P5Sustancia: string;
    SigueIngiriendo: string;
    CapturaPreguntasPt2: string;
}

export interface ConfiguracionPlanExcel {
    ConfiguracionPlan: string;
    CotizarPlan: string;
    RedProveedores: string;
    Deducible: string;
    FrecuenciaPago: string;
}

export interface PerfilCotizacionExcel
    extends Omit<
        EscenarioExcel,
        | "EscenarioPrueba"
        | "ConfiguracionPlan"
        | "CotizarPlan"
        | "RedProveedores"
        | "Deducible"
        | "FrecuenciaPago"
    > {}

export interface EscenarioEmisionExcel {
    EscenarioPrueba: string;
    CorreoClaims: string;
    ContrasenaClaims: string | number;
    UrlClaims: string;
    /** @deprecated La emisión usa ahora la póliza generada por el cotizador. */
    FolioSolicitante?: string | number;
}
