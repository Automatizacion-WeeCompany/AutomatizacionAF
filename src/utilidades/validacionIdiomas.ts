import { expect, Page } from '@playwright/test';
import { VALIDACIONES_PANTALLA } from '../configuraciones/validacionesPantallas';
import { GeneradorDatos } from './GeneradorDatos';
import { registrarInfo } from './LoggerPruebas';
import { ValidarTextos } from './ValidarTextosPagina';

export type Idioma = 'Esp' | 'Eng' | 'Port';

const OPCIONES_POR_IDIOMA = {
    OcupacionTitular: {
        'Arte/Entretenimiento/Medios': {
            Esp: 'Arte/Entretenimiento/Medios',
            Eng: 'Arts/Entertainment/Media',
            Port: 'Artes/Entretenimento/Mídia'
        }
    },
    TipoIdentificacionTitular: {
        'ID del país': {
            Esp: 'ID del país',
            Eng: 'Country ID',
            Port: 'ID do país'
        }
    },
    RelacionSolicitantePrimario: {
        'Cónyuge/Pareja Doméstica': {
            Esp: 'Cónyuge/Pareja Doméstica',
            Eng: 'Spouse/Domestic Partner',
            Port: 'Cônjuge/Parceiro Doméstico'
        }
    },
    Sustancia: {
        'Productos de Nicotina': {
            Esp: 'Productos de Nicotina',
            Eng: 'Nicotine Products',
            Port: 'Produtos de Nicotina'
        }
    }
} as const;

export type CatalogoTraducible = keyof typeof OPCIONES_POR_IDIOMA;

export function obtenerOpcionPorIdioma(
    catalogo: CatalogoTraducible,
    valorCanonico: string,
    idioma: Idioma
): string {
    const opciones = OPCIONES_POR_IDIOMA[catalogo] as Record<
        string,
        Record<Idioma, string>
    >;
    const traduccion = opciones[valorCanonico]?.[idioma];

    if (!traduccion) {
        throw new Error(
            `No existe traducción para "${valorCanonico}" en ${catalogo} (${idioma})`
        );
    }

    return traduccion;
}

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
    const configPantalla = VALIDACIONES_PANTALLA[pantalla];
    if (!configPantalla) {
        throw new Error(`Pantalla no configurada: ${pantalla}`);
    }

    const jsonPath = configPantalla.textosEsperados[idioma];
    if (!jsonPath) {
        throw new Error(`Idioma ${idioma} no configurado para pantalla ${pantalla}`);
    }

    registrarInfo(`🧪 Validando pantalla "${pantalla}" en idioma "${idioma}"`);

    const textoListo = configPantalla.textoListo[idioma];
    const body = configPantalla.iframeSelector
        ? page.frameLocator(configPantalla.iframeSelector).locator('body')
        : page.locator('body');

    await body.waitFor({ state: 'visible', timeout: 15000 });
    await expect.poll(
        async () => (await body.innerText()).includes(textoListo),
        {
            timeout: 15000,
            message: `La pantalla ${pantalla} no terminó de cargar el idioma ${idioma}`
        }
    ).toBe(true);

    // 1️⃣ Validar textos esperados
    const resultadoTextos = configPantalla.iframeSelector
        ? await ValidarTextos.validarTextosEnIframe({
            page,
            iframeSelector: configPantalla.iframeSelector,
            jsonPath
        })
        : await ValidarTextos.validarTextosEsperados({
            context: page,
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
    const faltantes: string[] = [];
    const placeholders = configPantalla.placeholders[idioma];

    for (const placeholder of placeholders) {
        const locator = configPantalla.iframeSelector
            ? page.frameLocator(configPantalla.iframeSelector).locator(placeholder.selector)
            : page.locator(placeholder.selector);
        const visible = await locator.isVisible();

        registrarInfo(`🔎 Placeholder ${placeholder.nombre}: ${visible}`);

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
        registrarInfo(`✅ Todos los placeholders visibles en ${pantalla}`);
    }
}
