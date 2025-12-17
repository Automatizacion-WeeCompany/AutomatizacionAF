// import { Page } from '@playwright/test';

// export async function obtenerDatosConfirmacion(page: Page) {
//     const getValue = async (label: string) => {
//         const text = await page.locator(`h2:has-text("${label}")`).innerText();
//         return text.split(':').pop()!.trim();
//     };

//     const nombreProducto = await getValue("Nombre del Producto");
//     const numeroPoliza   = await getValue("Número de póliza/plan");
//     const folio          = await getValue("Folio de compra");

//     return { nombreProducto, numeroPoliza, folio };
// }


// export async function obtenerDatosConfirmacion(page: Page) {
//     // Esperar a que los tres elementos existan
//     await page.waitForSelector('#lbl_NoPoliza', { timeout: 30000 });
//     await page.waitForSelector('#lbl_NoReferencia', { timeout: 30000 });

//     // Extraer textos completos
//     const txtNombreProducto = (await page.locator('#lbl_NoPoliza').textContent())?.trim() || '';
//     const txtReferencia     = (await page.locator('#lbl_NoReferencia').textContent())?.trim() || '';

//     // Separar valores después del carácter ":"
//     const nombreProducto = txtNombreProducto.split(':').slice(1).join(':').trim();
//     const numeroPoliza   = txtReferencia.split(':').slice(1).join(':').trim();
//     const folio          = numeroPoliza; // Porque en tu UI el folio y referencia usan el mismo ID

//     return {
//         nombreProducto,
//         numeroPoliza,
//         folio
//     };
// }


// export async function obtenerDatosConfirmacion(page: Page) {
//     const nombreProducto = (await page.locator('text=Nombre del Producto').locator('#lbl_NoPoliza').textContent())?.trim();
//     const numeroPoliza = (await page.locator('text=Número de póliza/plan').locator('#lbl_NoReferencia').textContent())?.trim();
//     const folio = (await page.locator('text=Folio de compra').locator('#lbl_NoReferencia').textContent())?.trim();

//     return {
//         nombreProducto: nombreProducto || '',
//         numeroPoliza: numeroPoliza || '',
//         folio: folio || ''
//     };
//}
// import { Page } from '@playwright/test';
// import ExcelJS from 'exceljs';
// import path from 'path';
// import fs from 'fs';

// // ------------------------------
// // 1. Extraer datos de la pantalla
// // ------------------------------
// export async function obtenerDatosConfirmacion(page: Page) {

//     const getValue = async (label: string): Promise<string> => {
//         const locator = page.locator(`h2:has-text("${label}")`);
//         await locator.waitFor({ state: 'visible', timeout: 20000 });

//         const text = await locator.innerText();
//         return text.split(':').pop()?.trim() ?? '';
//     };

//     return {
//         nombreProducto: await getValue("Nombre del Producto"),
//         numeroPoliza: await getValue("Número de póliza/plan"),
//         folio: await getValue("Folio de compra")
//     };
// }


// // -------------------------------------------------------------
// // 2. Guardar datos en Excel agregando un HISTÓRICO (no sobrescribe)
// // -------------------------------------------------------------
// export async function guardarExcelConfirmacionHistorico(data: {
//     nombreProducto: string;
//     numeroPoliza: string;
//     folio: string;
// }) {

//     const rutaExcel = path.join(__dirname, '../Evidencias/ReportePolizas.xlsx');

//     const workbook = new ExcelJS.Workbook();

//     // Si el archivo existe → cargarlo
//     if (fs.existsSync(rutaExcel)) {
//         await workbook.xlsx.readFile(rutaExcel);
//     }

//     // Obtener hoja o crearla si no existe
//     let sheet = workbook.getWorksheet('Resultado');
//     if (!sheet) {
//         sheet = workbook.addWorksheet('Resultado');
//         sheet.columns = [
//             { header: 'Fecha', key: 'fecha', width: 20 },
//             { header: 'Hora', key: 'hora', width: 20 },
//             { header: 'Producto', key: 'producto', width: 40 },
//             { header: 'Número de Póliza', key: 'poliza', width: 40 },
//             { header: 'Folio', key: 'folio', width: 40 }
//         ];
//     }

//     // Obtener fecha y hora actual
//     const ahora = new Date();
//     const fecha = ahora.toLocaleDateString('es-MX');
//     const hora = ahora.toLocaleTimeString('es-MX');

//     // Agregar fila con datos
//     sheet.addRow({
//         fecha,
//         hora,
//         producto: data.nombreProducto,
//         poliza: data.numeroPoliza,
//         folio: data.folio
//     });

//     // Guardar archivo actualizado
//     await workbook.xlsx.writeFile(rutaExcel);

//     console.log(`📄 Datos agregados al histórico en: ${rutaExcel}`);
// }
import { Page } from '@playwright/test';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

// ------------------------------
// 1. Extraer datos de la pantalla
// ------------------------------
export async function obtenerDatosConfirmacion(page: Page) {

    const productosLocator = page.locator('h2', { hasText: "Nombre del Producto" });
    const polizasLocator = page.locator('h2', { hasText: "Número de póliza/plan" });
    const foliosLocator = page.locator('h2', { hasText: "Folio de compra" });

    const countProductos = await productosLocator.count();
    const countPolizas = await polizasLocator.count();
    const countFolios = await foliosLocator.count();

    const productos: string[] = [];
    const polizas: string[] = [];
    const folios: string[] = [];

    for (let i = 0; i < countProductos; i++) {
        const txt = await productosLocator.nth(i).innerText();
        productos.push(txt.split(':').pop()?.trim() ?? '');
    }

    for (let i = 0; i < countPolizas; i++) {
        const txt = await polizasLocator.nth(i).innerText();
        polizas.push(txt.split(':').pop()?.trim() ?? '');
    }

    for (let i = 0; i < countFolios; i++) {
        const txt = await foliosLocator.nth(i).innerText();
        folios.push(txt.split(':').pop()?.trim() ?? '');
    }

    return { productos, polizas, folios };
}

// -------------------------------------------------------------
// 2. Guardar datos en Excel agregando un HISTÓRICO (no sobrescribe)
// -------------------------------------------------------------
// -------------------------------------------------------------
// 2. Guardar datos en Excel por WORKER (histórico dentro de cada worker)
// -------------------------------------------------------------
export async function guardarExcelConfirmacionHistorico(
    data: { productos: string[]; polizas: string[]; folios: string[] },
    workerId: string = process.env.TEST_WORKER_INDEX ?? '0'   // <- valor por defecto
) {
    // Archivo por worker: evita conflictos cuando hay N flujos en paralelo
    const fileName = `ReportePolizas_worker${workerId}.xlsx`;
    const rutaExcel = path.join(__dirname, '../Evidencias', fileName);

    const workbook = new ExcelJS.Workbook();

    // Si el archivo de ESTE worker existe → lo cargamos para agregar más filas
    if (fs.existsSync(rutaExcel)) {
        await workbook.xlsx.readFile(rutaExcel);
    }

    let sheet = workbook.getWorksheet('Resultado');
    if (!sheet) {
        sheet = workbook.addWorksheet('Resultado');
        sheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Hora', key: 'hora', width: 15 },
            { header: 'Producto', key: 'producto', width: 40 },
            { header: 'Número de Póliza', key: 'poliza', width: 40 },
            { header: 'Folio', key: 'folio', width: 30 }
        ];
    }

    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-MX');
    const hora = ahora.toLocaleTimeString('es-MX');

    console.log('🧾 Escribiendo productos:', data.productos);
    console.log('🧾 Escribiendo polizas:', data.polizas);
    console.log('🧾 Escribiendo folios:', data.folios);

    const total = data.productos.length;

    for (let i = 0; i < total; i++) {
        sheet.addRow({
            fecha,
            hora,
            producto: data.productos[i] ?? '',
            poliza: data.polizas[i] ?? '',
            folio: data.folios[i] ?? ''
        });
    }

    await workbook.xlsx.writeFile(rutaExcel);
    console.log(`📄 Excel del worker ${workerId} actualizado correctamente: ${rutaExcel}`);
}





