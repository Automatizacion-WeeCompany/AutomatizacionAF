// utilerias/ObtencionDeDatos.ts
/*
@parametro obtenerEscenariosPorHoja: Lee los datos de los escenarios desde un archivo Excel y los devuelve como una lista de objetos.
*/
import path from 'path';
import { CargarExcel } from './CargaDatosExcel';

export class ExtraerDatosExcel {
  static obtenerEscenariosPorHoja(nombreHoja: string) {
    const rutaExcel = path.join(__dirname, '../datos/SuitePruebas.xlsx');
    const excel = new CargarExcel(rutaExcel, nombreHoja);
    return excel.obtenerTodosLosDatos();
  }
}

