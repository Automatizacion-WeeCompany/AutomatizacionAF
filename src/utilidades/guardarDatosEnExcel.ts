import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export function guardarDatosEnExcel(datos: any, rutaExcel: string) {
    const fechaHora = new Date().toLocaleString('es-MX');

    const nuevaFila = {
        FechaHora: fechaHora,
        Producto: datos.nombreProducto,
        Poliza: datos.numeroPoliza,
        FolioCompra: datos.folio
    };

    let workbook;
    let hoja;

    // Si el archivo ya existe → cargarlo
    if (fs.existsSync(rutaExcel)) {
        workbook = XLSX.readFile(rutaExcel);
        hoja = workbook.Sheets['Resultados'] || XLSX.utils.json_to_sheet([]);
    } else {
        // Si NO existe → crear nuevo libro
        workbook = XLSX.utils.book_new();
        hoja = XLSX.utils.json_to_sheet([]);
    }

    // Convertimos la hoja a JSON, agregamos fila
    const datosExistentes = XLSX.utils.sheet_to_json(hoja);
    datosExistentes.push(nuevaFila);

    // Reconvertimos a hoja
    const nuevaHoja = XLSX.utils.json_to_sheet(datosExistentes);
    XLSX.utils.book_append_sheet(workbook, nuevaHoja, 'Resultados');

    // Guardar archivo sobreescribiendo
    XLSX.writeFile(workbook, rutaExcel);
}
