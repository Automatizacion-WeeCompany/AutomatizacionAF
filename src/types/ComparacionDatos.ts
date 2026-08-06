export type EstadoComparacion =
  | "Coincide"
  | "Diferente"
  | "NoComparable";

export interface ComparacionCampo {
  pestana: string;
  campo: string;
  esperado: string;
  obtenido: string;
  estado: EstadoComparacion;
  fuenteCotizador: string;
  fuenteClaims: string;
  detalle?: string;
}

export interface ComparacionPestana {
  pestana: string;
  comparaciones: ComparacionCampo[];
  resumen: ResumenComparacion;
}

export interface ResumenComparacion {
  total: number;
  coinciden: number;
  diferentes: number;
  noComparables: number;
}

export interface ResultadoComparacionDatos {
  idEjecucion: string;
  fechaHora: string;
  escenario: string;
  numeroPoliza: string;
  estado: "Exitosa" | "ConDiferencias" | "Error";
  resumen: ResumenComparacion;
  pestanas: ComparacionPestana[];
  error?: {
    etapa: string;
    mensaje: string;
  };
}
