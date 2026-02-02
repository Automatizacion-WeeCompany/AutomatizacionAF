import { Page } from '@playwright/test';
import { VALIDACIONES_PANTALLA } from '../configuraciones/validacionesPantallas';
import { GeneradorDatos } from './GeneradorDatos';
import { ValidarTextos } from './ValidarTextosPagina';

export type Idioma = 'Esp' | 'Eng' | 'Port';

interface ValidarPantallaParams {
    page: Page;
    pantalla: keyof typeof VALIDACIONES_PANTALLA;
    idioma: Idioma;
}

export async function validarPantallaPorIdioma({
    page,
    pantalla,
    idioma
}: ValidarPantallaParams) {
    await page.waitForTimeout(4000);
    const configPantalla = VALIDACIONES_PANTALLA[pantalla];
    if (!configPantalla) {
        throw new Error(`Pantalla no configurada: ${pantalla}`);
    }

    const jsonPath = configPantalla.textosEsperados[idioma];
    if (!jsonPath) {
        throw new Error(`Idioma ${idioma} no configurado para pantalla ${pantalla}`);
    }

    console.log(`🧪 Validando pantalla "${pantalla}" en idioma "${idioma}"`);

    // 1️⃣ Validar textos esperados
    const resultadoTextos = await ValidarTextos.validarTextosEnIframe({
        page,
        iframeSelector: configPantalla.iframeSelector,
        jsonPath
    });

    if (resultadoTextos.estado !== 'Éxito') {
        GeneradorDatos.guardarResultadoJSON(
            resultadoTextos,
            './src/textosEsperados/textosFaltantes',
            `TextosFaltantes_${pantalla}_${idioma}`
        );
    }

    // 2️⃣ Validar placeholders dinámicos
    const frame = page.frameLocator(configPantalla.iframeSelector);
    const faltantes: string[] = [];

    for (const placeholder of configPantalla.placeholders) {
        const locator = frame.locator(placeholder.selector);
        const visible = await locator.isVisible();

        console.log(`🔎 Placeholder ${placeholder.nombre}: ${visible}`);

        if (!visible) {
            faltantes.push(placeholder.nombre);
        }
    }

    if (faltantes.length > 0) {
        GeneradorDatos.guardarResultadoJSON(
            {
                estado: 'Faltan placeholders',
                pantalla,
                idioma,
                faltantes,
                fecha: new Date().toISOString()
            },
            './src/Evidencias/PlaceHoldersFaltantes',
            `PlaceholdersFaltantes_${pantalla}_${idioma}`
        );
    } else {
        console.log(`✅ Todos los placeholders visibles en ${pantalla}`);
    }
}
