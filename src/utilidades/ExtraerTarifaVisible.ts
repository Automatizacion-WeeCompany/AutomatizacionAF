import { expect, Locator } from '@playwright/test';
import { DatosTarifaVisible } from '../types/ValidacionTarifas';

export class TarifaNoDisponibleError extends Error {
  constructor(detalle: string) {
    super(detalle);
    this.name = 'TarifaNoDisponibleError';
  }
}

function convertirMonto(valor: string) {
  const limpio = valor.replace(/[^\d.,]/g, '');
  const ultimaComa = limpio.lastIndexOf(',');
  const ultimoPunto = limpio.lastIndexOf('.');

  if (ultimaComa >= 0 && ultimoPunto >= 0) {
    const separadorDecimal = ultimaComa > ultimoPunto ? ',' : '.';
    const separadorMiles = separadorDecimal === ',' ? '.' : ',';
    return Number(
      limpio.split(separadorMiles).join('').replace(separadorDecimal, '.'),
    );
  }
  if (/^\d{1,3}([,.]\d{3})+$/.test(limpio)) {
    return Number(limpio.replace(/[,.]/g, ''));
  }
  return Number(limpio.replace(',', '.'));
}

export function extraerTarifaVisible(
  valores: string[],
  selector: string,
): DatosTarifaVisible | undefined {
  const valoresVisibles = valores
    .map((texto) => texto.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const texto of valoresVisibles) {
    const coincidencia = texto.match(/(?:USD\s*)?\$?\s*([\d][\d.,]*)\s*(?:USD)?/i);
    if (!coincidencia) {
      continue;
    }
    const monto = convertirMonto(coincidencia[1]);
    if (Number.isFinite(monto) && monto > 0) {
      return { texto, monto, valoresVisibles, selector };
    }
  }
  return undefined;
}

interface CandidatoTarifa {
  locator: Locator;
  selector: string;
  sufijoTexto?: () => Promise<string>;
}

interface OpcionesObtenerTarifa {
  timeout?: number;
  opcional?: boolean;
  mensaje?: string;
}

export async function obtenerTarifaVisible(
  candidatos: CandidatoTarifa[],
  opciones: OpcionesObtenerTarifa = {},
): Promise<DatosTarifaVisible | undefined> {
  const timeout = opciones.timeout ?? 30000;
  let textos: string[] = [];
  let selector = candidatos.map((candidato) => candidato.selector).join(' | ');
  let tarifa: DatosTarifaVisible | undefined;

  try {
    await expect
      .poll(
        async () => {
          const candidato =
            (await Promise.all(
              candidatos.map(async (item) => ({
                item,
                cantidad: await item.locator.count(),
              })),
            )).find(({ cantidad }) => cantidad > 0)?.item ?? candidatos[0];

          selector = candidato.selector;
          textos = await candidato.locator.allInnerTexts();
          if (candidato.sufijoTexto) {
            const sufijo = (await candidato.sufijoTexto()).trim();
            if (sufijo) {
              textos = textos.map((texto) => `${texto} ${sufijo}`);
            }
          }
          tarifa = extraerTarifaVisible(textos, selector);
          return Boolean(tarifa);
        },
        {
          timeout,
          message:
            opciones.mensaje ??
            `No se mostró una tarifa monetaria positiva en ${selector}`,
        },
      )
      .toBe(true);
  } catch (error) {
    const valores = textos
      .map((texto) => texto.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (opciones.opcional && valores.length === 0) {
      return undefined;
    }
    throw new TarifaNoDisponibleError(
      `${opciones.mensaje ?? 'No se mostró una tarifa monetaria positiva'}. ` +
        `Selector: ${selector}. Valores visibles: ${valores.join(' | ') || 'ninguno'}`,
    );
  }

  return tarifa;
}
