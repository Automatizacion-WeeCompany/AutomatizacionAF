// utilerias/ObtencionDeDatos.ts
/*
@parametro obtenerEscenariosPorHoja: Lee los datos de los escenarios desde un archivo Excel y los devuelve como una lista de objetos.
*/
import path from 'node:path';
import { CargarExcel } from './CargaDatosExcel';
import { validarEscenariosExcel } from './ValidarEscenariosExcel';
import {
  ConfiguracionPlanExcel,
  EscenarioExcel,
  PerfilCotizacionExcel,
} from '../types/EscenarioExcel';
import { generarEscenariosCotizador } from './GenerarEscenariosCotizador';

export class ExtraerDatosExcel {
  private static escenariosCotizador: EscenarioExcel[] | undefined;

  static obtenerEscenariosPorHoja(nombreHoja: string) {
    const rutaExcel = path.join(__dirname, '../datos/SuitePruebas.xlsx');
    const excel = new CargarExcel(rutaExcel, nombreHoja);
    return validarEscenariosExcel(nombreHoja, excel.obtenerTodosLosDatos());
  }

  static obtenerEscenariosCotizador() {
    if (!this.escenariosCotizador) {
      const configuraciones = this.obtenerEscenariosPorHoja(
        'ConfiguracionesPlan',
      ) as ConfiguracionPlanExcel[];
      const perfiles = this.obtenerEscenariosPorHoja(
        'PerfilesCotizacion',
      ) as PerfilCotizacionExcel[];
      this.escenariosCotizador = generarEscenariosCotizador(
        configuraciones,
        perfiles,
      );
    }

    return [...this.escenariosCotizador];
  }
}
