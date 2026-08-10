//import { faker } from '@faker-js/faker';
import fs from 'fs';
import * as XLSX from 'xlsx';

export type DatosGenerales = {
  nombre: string;
  correo: string;
  telefono: string;
  fecha: string;
};

export class GeneradorDatos {

  static obtenerFechaActual(): string {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Leer desde JSON
  static leerDesdeJSON(path: string): DatosGenerales[] {
    const raw = fs.readFileSync(path, 'utf-8');
    return JSON.parse(raw) as DatosGenerales[];
  }

  // Leer desde Excel
  static leerDesdeExcel(path: string): DatosGenerales[] {
    const workbook = XLSX.readFile(path);
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(hoja) as DatosGenerales[];
  }

  // Exportar a CSV
  static exportarCSV(datos: DatosGenerales[], path: string): void {
    const contenido = ['Nombre,Correo,Telefono', ...datos.map(d => `${d.nombre},${d.correo},${d.telefono}`)];
    fs.writeFileSync(path, contenido.join('\n'), 'utf-8');
  }

  // Exportar a JSON
  static exportarJSON(datos: DatosGenerales[], path: string): void {
    fs.writeFileSync(path, JSON.stringify(datos, null, 2), 'utf-8');
  }

  // Exportar a Excel
  static guardarCSV(datos: DatosGenerales, carpeta: string): void {
    const fecha = this.obtenerFechaActual();
    const path = `${carpeta}/usuarios-${fecha}.csv`;

    const existe = fs.existsSync(path);
    const linea = `${datos.nombre},${datos.correo},${datos.telefono},${datos.fecha}\n`;

    if (!existe) {
      fs.writeFileSync(path, 'Nombre,Correo,Telefono,Fecha\n' + linea, 'utf-8');
    } else {
      fs.appendFileSync(path, linea, 'utf-8');
    }
  }

  //Guarda los datos usuados en la preba
  static guardarJSON(datos: DatosGenerales, carpeta: string): void {
    const fecha = this.obtenerFechaActual();
    const path = `${carpeta}/usuarios-de-la-prueba-generada-${fecha}.json`;
    const existentes: DatosGenerales[] = fs.existsSync(path)
      ? JSON.parse(fs.readFileSync(path, 'utf-8'))
      : [];
    existentes.push(datos);
    fs.writeFileSync(path, JSON.stringify(existentes, null, 2), 'utf-8');
  }

  static guardarResultadoJSON(data: any, carpeta: string, nombreArchivo: string): void {
    const path = require('path');
    const fecha = this.obtenerFechaActual();
    const idWorker = (process.env.TEST_WORKER_INDEX ?? '0').replace(
      /[^a-zA-Z0-9_-]/g,
      '-',
    );
    const nombreArchivoConFecha = `${nombreArchivo}-${fecha}-worker-${idWorker}.json`;
    const rutaCompleta = path.join(carpeta, nombreArchivoConFecha);

    let datosAnteriores: any[] = [];

    // Si el archivo ya existe, cargar datos anteriores
    if (fs.existsSync(rutaCompleta)) {
      const raw = fs.readFileSync(rutaCompleta, 'utf-8');
      datosAnteriores = JSON.parse(raw);
    }

    // Agregar el nuevo dato
    datosAnteriores.push(data);

    // Escribir de nuevo el archivo con todos los datos
    fs.writeFileSync(rutaCompleta, JSON.stringify(datosAnteriores, null, 2), 'utf-8');

    //fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');

  }
}
