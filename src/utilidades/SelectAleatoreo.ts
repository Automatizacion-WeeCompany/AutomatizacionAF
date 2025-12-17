import { Page, Locator } from '@playwright/test';

export async function seleccionarOpcionAleatoria(page: Page, selector: string): Promise<{ value: string; text: string }> {

  console.log(`${selector}`);

  const opciones = await page.$$eval(`${selector} option`, options => {
    return Array.from(options)
      .filter(option => option instanceof HTMLOptionElement).map(option => ({
        value: (option as HTMLOptionElement).value,
        text: option.textContent?.trim() || ''
      }));
  });
  console.log(opciones);
  const opcionesValidas = opciones.filter(o => o.value !== ''
    && o.text !== 'Seleccione una opción'
    && o.text !== 'Selecciona una opcion'
    && o.text !== 'Estado civil'
    && o.text !== 'Sexo'
    && o.text !== 'Entidad de nacimiento'
    && o.text !== 'Parentesco'
    && o.text !== 'Desconocido1'
    && o.text !== 'Colonia'
    && o.text !== 'Selecciona tu regimen fiscal'
    && o.text !== 'Mes'
    && o.text !== 'Día'
    && o.text !== 'Año'
    && o.text !== 'valorxxxxx');

  console.log(opcionesValidas);

  if (opcionesValidas.length === 0) {
    console.log(`❌ No hay opciones válidas en el selector: ${selector}`);
  }

  const indiceAleatorio = Math.floor(Math.random() * opcionesValidas.length);
  const opcionSeleccionada = opcionesValidas[indiceAleatorio];

  await page.selectOption(selector, opcionSeleccionada.value);
  console.log(`✅ Opción seleccionada para ${selector}: ${opcionSeleccionada.text}`);

  return opcionSeleccionada;
}


export async function seleccionarOpcionAleatoriaOriginal(page: Page, selector: string): Promise<{ value: string; text: string }> {

  const opciones = await page.$$eval(`${selector} option`, options => {
    return Array.from(options)
      .filter(option => option instanceof HTMLOptionElement).map(option => ({
        value: (option as HTMLOptionElement).value,
        text: option.textContent?.trim() || ''
      }));
  });

  const opcionesValidas = opciones.filter(o => o.text !== '' && o.text !== 'Colonia' && o.text != 'Sexo' && o.text !== 'Mes' && o.text != 'Dia' && o.text != 'Parentesco' && o.text != 'Estado civil');

  if (opcionesValidas.length === 0) {
    console.log(`❌ No hay opciones válidas en el selector: ${selector}`);
  }

  const indiceAleatorio = Math.floor(Math.random() * opcionesValidas.length);
  const opcionSeleccionada = opcionesValidas[indiceAleatorio];

  await page.selectOption(selector, opcionSeleccionada.value);
  console.log(`✅ Opción seleccionada para ${selector}: ${opcionSeleccionada.text}`);

  return opcionSeleccionada;
}

// export async function seleccionarOpcionAleatoriaOriginal(page: Page, selector: string | Locator): Promise<{ value: string; text: string }> {

//   const locator = typeof selector === "string" ? page.locator(selector) : selector;

//   const opciones = await locator.evaluateAll(options => {
//     return options.filter(o => o instanceof HTMLOptionElement).map(o => ({
//       value: (o as HTMLOptionElement).value, text: o.textContent?.trim() || ''
//     }));
//   });

//   const opcionesValidas = opciones.filter(o => o.value !== '' && !['Colonia', 'Sexo', 'Mes', 'Dia', 'Parentesco'].includes(o.text));

//   if (opcionesValidas.length === 0) {
//     console.log(`❌ No hay opciones válidas en el selector`);
//   }

//   const opcion = opcionesValidas[Math.floor(Math.random() * opcionesValidas.length)];

//   await locator.selectOption(opcion.value);
//   console.log(`✅ Opción seleccionada: ${opcion.text}`);

//   return opcion;
// }


export async function seleccionarAnoMayor18(page: Page, selector: string) {
  const anoActualMenos18 = new Date().getFullYear() - 19;

  const opciones = await page.$$eval(`${selector} option`, (opts, limite) => Array.from(opts).filter(o => o instanceof HTMLOptionElement).map(o => (o as HTMLOptionElement).value).filter(v => Number(v) > 0 && Number(v) <= limite), anoActualMenos18);

  if (opciones.length === 0) {
    throw new Error("❌ No se encontraron años válidos (mayores de edad).");
  }

  const anoAUsar = opciones[0]; // El más reciente permitido
  await page.selectOption(selector, anoAUsar);

  console.log("✅ Año seleccionado:", anoAUsar);
}


export async function seleccionarYVerificar(page: Page, selector: string, value: string) {
  const select = page.locator(selector);

  // 1. Esperar a que el <select> sea visible
  await select.waitFor({ state: 'visible', timeout: 10000 });

  // 2. Esperar a que tenga opciones reales (más de 1 opción)
  await page.waitForFunction(
    (sel: string) => {
      const el = document.querySelector(sel) as HTMLSelectElement | null;
      return !!el && el.options.length > 1;
    },
    selector, // 👈 un solo argumento
    { timeout: 15000 }
  );

  // 3. Seleccionar la opción
  await page.selectOption(selector, value);

  // 4. Verificar que el value realmente quedó seleccionado
  await page.waitForFunction(
    (args: { selector: string; value: string }) => {
      const el = document.querySelector(args.selector) as HTMLSelectElement | null;
      return !!el && el.value === args.value;
    },
    { selector, value },          // 👈 un solo objeto como arg
    { timeout: 8000 }
  );
}

