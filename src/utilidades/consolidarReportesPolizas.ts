import { Page } from '@playwright/test';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export async function consolidarReportesPolizas() {
    const carpeta = path.join(__dirname, '../Evidencias');
    const archivos = fs
        .readdirSync(carpeta)
        .filter(f => f.startsWith('ReportePolizas_worker') && f.endsWith('.xlsx'));

    if (archivos.length === 0) {
        console.log('⚠ No se encontraron archivos de worker para consolidar.');
        return;
    }

    const workbookFinal = new ExcelJS.Workbook();
    const sheetFinal = workbookFinal.addWorksheet('Consolidado');

    sheetFinal.columns = [
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Hora', key: 'hora', width: 15 },
        { header: 'Producto', key: 'producto', width: 40 },
        { header: 'Número de Póliza', key: 'poliza', width: 40 },
        { header: 'Folio', key: 'folio', width: 30 }
    ];

    for (const archivo of archivos) {
        const ruta = path.join(carpeta, archivo);
        console.log(`🔁 Leyendo archivo: ${ruta}`);

        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(ruta);
        const sheetSrc = wb.getWorksheet('Resultado');
        if (!sheetSrc) continue;

        sheetSrc.eachRow((row, rowIndex) => {
            // Saltar encabezados (fila 1)
            if (rowIndex === 1) return;

            const valores = row.values as any[];
            // row.values[0] está vacío, datos empiezan en [1]
            sheetFinal.addRow({
                fecha: valores[1],
                hora: valores[2],
                producto: valores[3],
                poliza: valores[4],
                folio: valores[5]
            });
        });
    }

    const rutaFinal = path.join(carpeta, 'ReportePolizas_Consolidado.xlsx');
    await workbookFinal.xlsx.writeFile(rutaFinal);
    console.log(`✅ Consolidado generado en: ${rutaFinal}`);
}
