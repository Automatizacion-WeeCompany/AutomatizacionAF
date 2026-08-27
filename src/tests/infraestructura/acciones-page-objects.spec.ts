import { expect, Page, test } from '@playwright/test';
import { SeleccionarPlanesAFPage } from '../../paginas/3seleccionPlanesAFPage';
import { InformacionPersonalPage } from '../../paginas/6informacionPersonalPage';
import { SolicitudClaimsPage } from '../../paginas/solicitudClaimsPage';

async function cargarContenidoEnIframe(page: Page, contenido: string) {
  await page.setContent('<iframe id="ifCotizador"></iframe>');
  const iframe = page.frames().find(frame => frame !== page.mainFrame());

  if (!iframe) {
    throw new Error('No se pudo crear el iframe de prueba');
  }

  await iframe.setContent(contenido);
  return iframe;
}

test.describe(
  '00. Infraestructura | acciones sincronizadas de Page Objects',
  { tag: '@smoke' },
  () => {
    test('selecciona el botón Atender solicitud accesible e ignora su copia oculta', async ({
      page,
    }) => {
      await page.setContent(`
        <style>.hide { display: none; }</style>
        <button type="button" class="hide">Atender solicitud</button>
        <button type="button" id="atender-visible">Atender solicitud</button>
        <a href="#InformacionGeneralEmision" class="hide">Información general</a>
        <section id="InformacionGeneralEmision" class="hide">Datos de emisión</section>
        <script>
          document.querySelector('#atender-visible').addEventListener('click', event => {
            event.currentTarget.classList.add('hide');
            document.querySelector('a[href="#InformacionGeneralEmision"]').classList.remove('hide');
            document.querySelector('#InformacionGeneralEmision').classList.remove('hide');
          });
        </script>
      `);

      await new SolicitudClaimsPage(page).ClickBtnAtenderSolicitud();

      await expect(page.locator('#atender-visible')).toBeHidden();
      await expect(page.locator('a[href="#InformacionGeneralEmision"]')).toBeVisible();
      await expect(page.locator('#InformacionGeneralEmision')).toBeVisible();
    });

    test('selecciona el plan dentro de Cotizar y omite opciones duplicadas ocultas', async ({
      page,
    }) => {
      const iframe = await cargarContenidoEnIframe(
        page,
        `
          <style>.hide { display: none; }</style>
          <div class="hide">
            <label for="Superior">Superior duplicado de Comparar</label>
          </div>
          <div id="CotizarTab">
            <span id="changePlan">
              Abrir planes
              <ul class="optionList hide">
                <li>
                  <input type="radio" name="optionPlan" id="Superior" value="1" />
                  <label for="Superior">Superior</label>
                </li>
              </ul>
            </span>
          </div>
          <script>
            document.querySelector('#changePlan').addEventListener('click', event => {
              if (event.target.id === 'changePlan') {
                document.querySelector('.optionList').classList.remove('hide');
              }
            });
          </script>
        `,
      );

      await new SeleccionarPlanesAFPage(page).seleccionarPlanSuperior();

      await expect(iframe.locator('#CotizarTab input[value="1"]')).toBeChecked();
    });

    test('espera y valida la respuesta de negocio al guardar un dependiente', async ({
      page,
    }) => {
      await page.route('https://app.test/**/AddDependientesAmerican', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            IsActionPermitted: true,
            IsOk: true,
            Data: { Table: [{ Dato: 1, Mensaje: '' }] },
          }),
        }),
      );
      const iframe = await cargarContenidoEnIframe(
        page,
        `
          <style>
            .modal-cover { display: none; }
            .modal-cover.show { display: block; }
          </style>
          <div class="modal-cover show" id="ModalAddDependiente">
            <button id="saveDatos">Agregar</button>
          </div>
          <div id="toast-container"></div>
          <script>
            document.querySelector('#saveDatos').addEventListener('click', async () => {
              const respuesta = await fetch(
                'https://app.test/AF/Application/API/Cotizador/AddDependientesAmerican',
                { method: 'POST' },
              );
              const cuerpo = await respuesta.json();
              if (cuerpo.Data.Table[0].Dato === 1) {
                document.querySelector('#ModalAddDependiente').classList.remove('show');
              }
            });
          </script>
        `,
      );

      await new InformacionPersonalPage(page).ClickBtnGuardarHijo();

      await expect(iframe.locator('#ModalAddDependiente')).toBeHidden();
    });

    test('genera un segundo nombre determinista usando sólo letras válidas', async ({
      page,
    }) => {
      const iframe = await cargarContenidoEnIframe(
        page,
        '<input id="txtNombreSegundo" class="ValidLetters" />',
      );

      const segundoNombre = await new InformacionPersonalPage(
        page,
      ).IngresaSegundoNombre(27);

      expect(segundoNombre).toBe('WeeBoot AA');
      await expect(iframe.locator('#txtNombreSegundo')).toHaveValue('WeeBoot AA');
    });

    test('restaura el país de nacimiento si el modal se vuelve a renderizar', async ({
      page,
    }) => {
      const iframe = await cargarContenidoEnIframe(
        page,
        `
          <select id="PaisNacimientoSelectDependiente">
            <option value="">Seleccione una opción</option>
            <option value="pais-qa">País QA</option>
          </select>
        `,
      );
      const informacionPersonal = new InformacionPersonalPage(page);

      await informacionPersonal.SeleccionaPaisNacimientoDependiente();
      await iframe.locator('#PaisNacimientoSelectDependiente').selectOption('');
      await informacionPersonal.AseguraPaisNacimientoDependiente();

      await expect(iframe.locator('#PaisNacimientoSelectDependiente')).toHaveValue(
        'pais-qa',
      );
    });

    test('conserva los países del beneficiario cuando la aplicación los autocompleta', async ({
      page,
    }) => {
      const iframe = await cargarContenidoEnIframe(
        page,
        `
          <select id="PaisResidenciaSelectBenef" disabled>
            <option value="residencia" selected>Residencia QA</option>
          </select>
          <select id="PaisCiudadaniaSelectBenef" disabled>
            <option value="ciudadania" selected>Ciudadanía QA</option>
          </select>
        `,
      );
      const informacionPersonal = new InformacionPersonalPage(page);

      await informacionPersonal.SeleccionaPaisRecidenciaBeneficiario();
      await informacionPersonal.SeleccionaCiudadaniaBeneficiario();

      await expect(iframe.locator('#PaisResidenciaSelectBenef')).toHaveValue(
        'residencia',
      );
      await expect(iframe.locator('#PaisCiudadaniaSelectBenef')).toHaveValue(
        'ciudadania',
      );
    });

    test('acepta la fecha que la aplicación autocompleta para un beneficiario existente', async ({
      page,
    }) => {
      const iframe = await cargarContenidoEnIframe(
        page,
        `
          <input id="datepickerBirthdayBeneficiario" />
          <script>
            const fecha = document.querySelector('#datepickerBirthdayBeneficiario');
            fecha.addEventListener('blur', () => {
              fecha.value = '08/24/1991';
              fecha.disabled = true;
            });
          </script>
        `,
      );

      await new InformacionPersonalPage(page).IngresaFechaNacimientoBeneficiario();

      await expect(iframe.locator('#datepickerBirthdayBeneficiario')).toHaveValue(
        '08/24/1991',
      );
      await expect(iframe.locator('#datepickerBirthdayBeneficiario')).toBeDisabled();
    });

    test('rechaza una respuesta HTTP 200 cuyo resultado de negocio no fue exitoso', async ({
      page,
    }) => {
      await page.route('https://app.test/**/AddDependientesAmerican', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            IsActionPermitted: true,
            IsOk: true,
            Data: { Table: [{ Dato: 0, Mensaje: 'El dependiente ya existe' }] },
          }),
        }),
      );
      await cargarContenidoEnIframe(
        page,
        `
          <div class="modal-cover show" id="ModalAddDependiente">
            <button id="saveDatos">Agregar</button>
          </div>
          <div id="toast-container"></div>
          <script>
            document.querySelector('#saveDatos').addEventListener('click', async () => {
              const respuesta = await fetch(
                'https://app.test/AF/Application/API/Cotizador/AddDependientesAmerican',
                { method: 'POST' },
              );
              const cuerpo = await respuesta.json();
              if (cuerpo.Data.Table[0].Dato !== 1) {
                const alerta = document.createElement('div');
                alerta.className = 'toast-error';
                alerta.textContent = cuerpo.Data.Table[0].Mensaje;
                document.querySelector('#toast-container').appendChild(alerta);
              }
            });
          </script>
        `,
      );

      await expect(
        new InformacionPersonalPage(page).ClickBtnGuardarHijo(),
      ).rejects.toThrow(/El dependiente ya existe/);
    });

    test('reporta una validación del formulario sin esperar el cierre del modal', async ({
      page,
    }) => {
      await cargarContenidoEnIframe(
        page,
        `
          <div class="modal-cover show" id="ModalAddDependiente">
            <input id="txtCelularDependiente" class="has-error" />
            <button id="saveDatos">Agregar</button>
          </div>
          <div id="toast-container"></div>
          <script>
            document.querySelector('#saveDatos').addEventListener('click', () => {
              const alerta = document.createElement('div');
              alerta.className = 'toast-error';
              alerta.textContent = 'Llene los datos solicitados';
              document.querySelector('#toast-container').appendChild(alerta);
            });
          </script>
        `,
      );

      await expect(
        new InformacionPersonalPage(page).ClickBtnGuardarHijo(),
      ).rejects.toThrow(
        /Llene los datos solicitados.*txtCelularDependiente/,
      );
    });
  },
);
