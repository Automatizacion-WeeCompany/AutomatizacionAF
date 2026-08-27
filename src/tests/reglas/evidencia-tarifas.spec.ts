import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { EscenarioExcel } from '../../types/EscenarioExcel';
import { PantallaTarifa } from '../../types/ValidacionTarifas';
import {
  descripcionAnotacionTarifa,
  EvidenciaValidacionTarifa,
} from '../../utilidades/EvidenciaValidacionTarifa';
import { extraerTarifaVisible } from '../../utilidades/ExtraerTarifaVisible';
import {
  calcularTarifaEsperada,
  TarifaNoCoincideError,
} from '../../utilidades/ValidarTarifaAF';

function crearEscenario(): EscenarioExcel {
  return {
    EscenarioPrueba: 'Evidencia de tarifa en todas las pantallas',
    PerfilCotizacion: 'Individual',
    ConfiguracionPlan: 'Protect LATAM Anual',
    TipoPoliza: 'Individual',
    ConyugePareja: 'No',
    HijosMenoresDe24: '0',
    IdiomaCotizacion: 'Esp',
    CotizarPlan: 'Protect',
    RedProveedores: 'Sin cobertura dentro de EE. UU.',
    Deducible: '$1,000.00 / $3,000.00 USD',
    FrecuenciaPago: 'Anual',
    ResultadoEsperado: 'Emision',
  } as EscenarioExcel;
}

async function crearEvidencia() {
  const escenario = crearEscenario();
  const entrada = {
    escenario,
    pais: { valor: 'AR', texto: 'Argentina' },
    edadTitular: 35,
  };
  const directorio = await mkdtemp(path.join(tmpdir(), 'af-tarifas-'));
  return {
    entrada,
    evidencia: await EvidenciaValidacionTarifa.crear(entrada, 1, directorio),
  };
}

test.describe('Evidencia de tarifas por pantalla', () => {
  test('extrae importes con formato internacional y conserva el selector', () => {
    expect(extraerTarifaVisible(['$1,372.50 USD'], '#totalAmount')).toMatchObject({
      monto: 1372.5,
      selector: '#totalAmount',
    });
    expect(extraerTarifaVisible(['USD $1.372,50'], '#MoneyLabel')).toMatchObject({
      monto: 1372.5,
      selector: '#MoneyLabel',
    });
  });

  test('guarda las cinco coincidencias y crea una anotación por pantalla', async () => {
    const { entrada, evidencia } = await crearEvidencia();
    const monto = calcularTarifaEsperada(entrada).montoPorRecibo;
    const pantallas: PantallaTarifa[] = [
      'Cotizacion',
      'ResumenPlanesCotizados',
      'ConfirmacionPlanPago',
      'AplicacionCompleta',
      'MetodoPago',
    ];
    const anotacionesAntes = test.info().annotations.length;

    for (const pantalla of pantallas) {
      await evidencia.validar(pantalla, {
        texto: `$${monto.toFixed(2)} USD`,
        monto,
        valoresVisibles: [`$${monto.toFixed(2)} USD`],
        selector: `#${pantalla}`,
      });
    }
    await evidencia.finalizarExito('Emision', 'POLIZA-PRUEBA');

    const reporte = JSON.parse(
      await readFile(evidencia.rutaReporteJson, 'utf8'),
    );
    expect(reporte).toMatchObject({
      schemaVersion: 1,
      estado: 'Exitosa',
      resultadoFlujo: 'Emision',
      numeroPoliza: 'POLIZA-PRUEBA',
      resumen: {
        pantallasValidadas: 5,
        exitosas: 5,
        diferencias: 0,
      },
    });
    expect(reporte.validaciones.map((item: { pantalla: string }) => item.pantalla))
      .toEqual(pantallas);
    expect(
      test.info().annotations
        .slice(anotacionesAntes)
        .filter((anotacion) => anotacion.type === 'tarifa-validada'),
    ).toHaveLength(5);
  });

  test('persiste la diferencia antes de detener el flujo', async () => {
    const { entrada, evidencia } = await crearEvidencia();
    const monto = calcularTarifaEsperada(entrada).montoPorRecibo;
    let errorCapturado: unknown;

    try {
      await evidencia.validar('Cotizacion', {
        texto: `$${(monto + 10).toFixed(2)} USD`,
        monto: monto + 10,
        valoresVisibles: [`$${(monto + 10).toFixed(2)} USD`],
        selector: '.monto',
      });
    } catch (error) {
      errorCapturado = error;
    }

    expect(errorCapturado).toBeInstanceOf(TarifaNoCoincideError);
    await evidencia.finalizarError(errorCapturado);
    const reporte = JSON.parse(
      await readFile(evidencia.rutaReporteJson, 'utf8'),
    );
    expect(reporte).toMatchObject({
      estado: 'Diferencia',
      resumen: { pantallasValidadas: 1, diferencias: 1 },
      validaciones: [
        {
          pantalla: 'Cotizacion',
          estado: 'Diferencia',
          selector: '.monto',
          comparacion: { diferencia: 10, coincide: false },
        },
      ],
    });
    expect(
      descripcionAnotacionTarifa(
        'Cotizacion',
        (errorCapturado as TarifaNoCoincideError).comparacion,
      ),
    ).toContain('Cotización');
  });
});
