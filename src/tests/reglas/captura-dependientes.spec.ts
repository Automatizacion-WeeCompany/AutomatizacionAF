import { expect, test } from '@playwright/test';
import { agruparDependientesCapturados } from '../../flows/comparacionDatosEmisionClaims.flow';
import { DatoCotizacionCapturado } from '../../utilidades/ContextoDatosCotizacion';

function campo(
  orden: number,
  clave: string,
  valor: string,
): DatoCotizacionCapturado {
  return {
    orden,
    clave,
    etiqueta: clave,
    tipoDato: 'entrada',
    tipoControl: 'text',
    valor,
    urlFrame: 'https://app.test/AF/Application',
  };
}

test.describe('01. Reglas de decisión | captura de dependientes', () => {
  test(
    'REG-CAPTURA-001 | observaciones repetidas al guardar → una persona por identidad',
    { tag: ['@regla', '@captura', '@dependiente'] },
    () => {
      const grupos = agruparDependientesCapturados([
        campo(1, 'optConyugue', '4'),
        campo(2, 'txtNombreDependiente', 'Andrea'),
        campo(3, 'txtApPatDependiente', 'López'),
        campo(4, 'datepickerBirthday', '08/24/1991'),
        campo(5, 'optConyugue', '4'),
        campo(6, 'txtNombreDependiente', 'Andrea'),
        campo(7, 'txtApPatDependiente', 'López'),
        campo(8, 'datepickerBirthday', '08/24/1991'),
        campo(9, 'optHijoBio', '35'),
        campo(10, 'txtNombreDependiente', 'Mateo'),
        campo(11, 'txtApPatDependiente', 'López'),
        campo(12, 'datepickerBirthday', '08/24/2016'),
        campo(13, 'optHijoBio', '35'),
        campo(14, 'txtNombreDependiente', 'Mateo'),
        campo(15, 'txtApPatDependiente', 'López'),
        campo(16, 'datepickerBirthday', '08/24/2016'),
      ]);

      expect(grupos).toHaveLength(2);
      expect(grupos.map(({ relacion }) => relacion)).toEqual([
        'Cónyuge',
        'Hijo Biológico',
      ]);
      expect(grupos.map(({ campos }) => campos.length)).toEqual([6, 6]);
    },
  );
});
