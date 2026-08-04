import * as XLSX from 'xlsx';

export class CargarExcel {
  private readonly datos: any[] = [];

  constructor(rutaArchivo: string, nombreHoja?: string) {
    const workbook = XLSX.readFile(rutaArchivo);
    const sheetName = nombreHoja || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(
        `No existe la hoja "${sheetName}" en ${rutaArchivo}. Hojas disponibles: ${workbook.SheetNames.join(', ')}`,
      );
    }
    this.datos = XLSX.utils.sheet_to_json(worksheet);
  }

  obtenerDato(index: number) {
    return this.datos[index];
  }

  obtenerCantidad() {
    return this.datos.length;
  }

  obtenerTodosLosDatos() {
    return this.datos;
  }
}
