export type IdiomaCotizacionExcel = "Esp" | "Eng" | "Port";
export type TipoPolizaExcel = "Familiar" | "Individual";

export interface EscenarioExcel {
    EscenarioPrueba: string;
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
