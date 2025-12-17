import { Page, Frame } from '@playwright/test';
import * as fs from 'fs';

export type ValidacionResultado = { estado: 'Éxito' | 'Faltan textos'; faltantes: string[]; fecha: string; };

type ValidarTextosOptions = { context: Page | Frame; jsonPath: string; };

type ValidarIframeOptions = { page: Page; iframeSelector: string; jsonPath: string; };

export class ValidarTextos {
  /**
   * Valida que existan todos los textos esperados en la página o iframe.
   */
  static async validarTextosEsperados(options: ValidarTextosOptions): Promise<ValidacionResultado> {
    const { context, jsonPath } = options;

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`❌ No se encontró el archivo JSON: ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const textosEsperados: string[] = JSON.parse(rawData); // el JSON debe ser un array

    const bodyText = await context.locator('body').innerText();
    const bodyTextNormalizado = bodyText.replace(/["“”]/g, '"').replace(/[’‘]/g, "'");

    const textosFaltantes = textosEsperados.filter(texto => {
      const textoNormalizado = texto.replace(/["“”]/g, '"').replace(/[’‘]/g, "'");
      return !bodyTextNormalizado.includes(textoNormalizado);
    });

    const resultado: ValidacionResultado = {
      estado: textosFaltantes.length === 0 ? 'Éxito' : 'Faltan textos',
      faltantes: textosFaltantes,
      fecha: new Date().toISOString()
    };

    console.log('Resultado de validación:', resultado);
    return resultado;
  }

  /**
   * Valida textos dentro de un iframe.
   */
  static async validarTextosEnIframe(options: ValidarIframeOptions): Promise<ValidacionResultado> {
    const { page, iframeSelector, jsonPath } = options;

    await page.waitForSelector(iframeSelector, { timeout: 10000 });

    const iframeElementHandle = await page.$(iframeSelector);
    const frame = await iframeElementHandle?.contentFrame();

    if (!frame) throw new Error(`❌ No se pudo obtener el frame de ${iframeSelector}`);

    return this.validarTextosEsperados({ context: frame, jsonPath });
  }
}