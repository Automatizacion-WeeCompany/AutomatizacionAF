import { Page } from "@playwright/test";
import { EscenarioExcel } from "../types/EscenarioExcel";

export type TipoDatoCotizacion = "entrada" | "seleccion" | "archivo";

export interface DatoCotizacionCapturado {
  orden: number;
  clave: string;
  etiqueta: string;
  tipoDato: TipoDatoCotizacion;
  tipoControl: string;
  valor: string;
  textoSeleccionado?: string;
  urlFrame: string;
}

export type ConfiguracionCotizacionCapturada = Omit<
  EscenarioExcel,
  "Url" | "CorreoInicio" | "Contrasena"
>;

export interface DatosCotizacionGuardados {
  configuracion: ConfiguracionCotizacionCapturada;
  campos: DatoCotizacionCapturado[];
  nombreTitular: string;
  numeroPoliza: string;
}

type DatoRecibido = Omit<DatoCotizacionCapturado, "orden" | "urlFrame">;

let consecutivoBinding = 0;

function obtenerConfiguracionSinCredenciales(
  escenario: EscenarioExcel,
): ConfiguracionCotizacionCapturada {
  const {
    Url: _url,
    CorreoInicio: _correoInicio,
    Contrasena: _contrasena,
    ...configuracion
  } = escenario;

  return { ...configuracion };
}

function esDatoRecibido(valor: unknown): valor is DatoRecibido {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const dato = valor as Partial<DatoRecibido>;
  return (
    typeof dato.clave === "string" &&
    typeof dato.etiqueta === "string" &&
    typeof dato.tipoDato === "string" &&
    typeof dato.tipoControl === "string" &&
    typeof dato.valor === "string" &&
    (dato.textoSeleccionado === undefined ||
      typeof dato.textoSeleccionado === "string")
  );
}

/**
 * Conserva los valores reales escritos y seleccionados en el cotizador.
 *
 * La captura se instala antes de navegar para cubrir también los iframes que
 * el cotizador y el checkout crean dinámicamente, pero sólo se activa después
 * del inicio de sesión. De esta forma las credenciales de acceso no forman
 * parte del contexto que posteriormente se comparará en Claims.
 */
export class ContextoDatosCotizacion {
  private readonly nombreBinding =
    `__registrarDatoCotizacion_${consecutivoBinding++}`;
  private readonly campos: DatoCotizacionCapturado[] = [];
  private activo = false;
  private preparado = false;

  constructor(private readonly page: Page) {}

  async preparar() {
    if (this.preparado) {
      return;
    }

    await this.page.exposeBinding(
      this.nombreBinding,
      ({ frame }, dato: unknown) => {
        if (!this.activo || !esDatoRecibido(dato)) {
          return;
        }

        const registro: DatoCotizacionCapturado = {
          ...dato,
          orden: this.campos.length + 1,
          urlFrame: frame.url(),
        };
        const anterior = this.campos[this.campos.length - 1];

        // Un click sobre un label normalmente dispara también change. Se
        // conserva una sola observación cuando ambos eventos son idénticos.
        if (
          anterior?.clave === registro.clave &&
          anterior.valor === registro.valor &&
          anterior.textoSeleccionado === registro.textoSeleccionado &&
          anterior.urlFrame === registro.urlFrame
        ) {
          return;
        }

        this.campos.push(registro);
      },
    );

    await this.page.addInitScript(
      ({ binding }) => {
        type BindingCaptura = (dato: {
          clave: string;
          etiqueta: string;
          tipoDato: "entrada" | "seleccion" | "archivo";
          tipoControl: string;
          valor: string;
          textoSeleccionado?: string;
        }) => Promise<void>;

        const enviar = (elemento: HTMLElement, forzarSeleccion = false) => {
          const campo = elemento as HTMLInputElement | HTMLSelectElement;
          const tipoControl =
            campo instanceof HTMLInputElement
              ? campo.type || "input"
              : campo instanceof HTMLSelectElement
                ? "select"
                : elemento.tagName.toLowerCase();

          if (
            ["button", "submit", "reset", "hidden", "password"].includes(
              tipoControl,
            )
          ) {
            return;
          }

          const id = elemento.id;
          const etiquetaFor = id
            ? Array.from(
                document.querySelectorAll<HTMLLabelElement>(
                  `label[for="${CSS.escape(id)}"]`,
                ),
              )
                .map((label) => label.textContent?.trim() ?? "")
                .find(Boolean)
            : undefined;
          const etiqueta =
            etiquetaFor?.trim() ||
            elemento.getAttribute("aria-label")?.trim() ||
            elemento.getAttribute("placeholder")?.trim() ||
            campo.name?.trim() ||
            id ||
            elemento.textContent?.trim() ||
            "campo-sin-identificador";
          const clave = id || campo.name || etiqueta;

          let tipoDato: "entrada" | "seleccion" | "archivo" = "entrada";
          let valor = campo.value ?? elemento.textContent?.trim() ?? "";
          let textoSeleccionado: string | undefined;

          if (campo instanceof HTMLSelectElement) {
            tipoDato = "seleccion";
            textoSeleccionado = campo.selectedOptions[0]?.textContent?.trim();
          } else if (campo instanceof HTMLInputElement && campo.type === "file") {
            tipoDato = "archivo";
            valor = Array.from(campo.files ?? [])
              .map((archivo) => archivo.name)
              .join(", ");
          } else if (
            campo instanceof HTMLInputElement &&
            ["radio", "checkbox"].includes(campo.type)
          ) {
            if (!campo.checked) {
              return;
            }
            tipoDato = "seleccion";
            textoSeleccionado = etiqueta;
          } else if (forzarSeleccion) {
            tipoDato = "seleccion";
            textoSeleccionado = elemento.textContent?.trim() || etiqueta;
            valor =
              elemento.getAttribute("data-value") || id || textoSeleccionado;
          }

          const registrar = (window as unknown as Record<string, unknown>)[
            binding
          ] as BindingCaptura | undefined;
          void registrar?.({
            clave,
            etiqueta,
            tipoDato,
            tipoControl,
            valor,
            textoSeleccionado,
          });
        };

        const capturarControlesVisibles = () => {
          const controles = document.querySelectorAll<HTMLElement>(
            "input, select, textarea",
          );

          for (const control of Array.from(controles)) {
            const campo = control as HTMLInputElement | HTMLSelectElement;
            const esArchivoConValor =
              campo instanceof HTMLInputElement &&
              campo.type === "file" &&
              Boolean(campo.files?.length);
            const esSeleccionMarcada =
              campo instanceof HTMLInputElement &&
              ["radio", "checkbox"].includes(campo.type) &&
              campo.checked &&
              Array.from(
                document.querySelectorAll<HTMLLabelElement>(
                  `label[for="${CSS.escape(campo.id)}"]`,
                ),
              ).some((etiqueta) => etiqueta.getClientRects().length > 0);
            const visible = control.getClientRects().length > 0;

            if (!visible && !esArchivoConValor && !esSeleccionMarcada) {
              continue;
            }
            if (
              campo instanceof HTMLInputElement &&
              !["radio", "checkbox", "file"].includes(campo.type) &&
              !campo.value.trim()
            ) {
              continue;
            }
            if (campo instanceof HTMLSelectElement && !campo.value) {
              continue;
            }

            enviar(control);
          }
        };

        document.addEventListener(
          "change",
          (evento) => {
            if (evento.target instanceof HTMLElement) {
              enviar(evento.target);
            }
          },
          true,
        );

        document.addEventListener(
          "click",
          (evento) => {
            if (!(evento.target instanceof Element)) {
              return;
            }

            const opcionPersonalizada = evento.target.closest<HTMLElement>(
              [
                '[role="option"]',
                ".iti__country",
                ".btnActionNameUno",
                ".btnActionNameDos",
                ".btnActionNameTres",
              ].join(", "),
            );
            if (opcionPersonalizada) {
              enviar(opcionPersonalizada, true);
              return;
            }

            const etiqueta = evento.target.closest<HTMLLabelElement>(
              "label[for]",
            );
            const idCampo = etiqueta?.htmlFor;
            const campoAsociado = idCampo
              ? document.getElementById(idCampo)
              : null;
            if (campoAsociado) {
              queueMicrotask(() => enviar(campoAsociado));
            }

            const confirmaDatos = evento.target.closest<HTMLElement>(
              [
                'button[id^="AddQuestion_"]',
                "#btnGuardarProcesoPaso2Parte1",
                "#btnGuardarProcesoPaso2Parte2",
                "#btnGuardarEspecialistaMedico",
                "#btnGuardarProcesoPaso1",
                "#saveBeneficiario",
                "#saveDatos",
                "#GoNextStepOne",
                "#GostepTwo",
                "#GostepFour",
                "#GostepFive",
              ].join(", "),
            );
            if (confirmaDatos) {
              capturarControlesVisibles();
            }
          },
          true,
        );
      },
      { binding: this.nombreBinding },
    );

    this.preparado = true;
  }

  activar() {
    if (!this.preparado) {
      throw new Error(
        "El contexto de datos debe prepararse antes de iniciar la cotización",
      );
    }
    this.activo = true;
  }

  async guardar(
    escenario: EscenarioExcel,
    confirmacion: { nombreTitular: string; numeroPoliza: string },
  ): Promise<DatosCotizacionGuardados> {
    // Permite que las últimas llamadas al binding terminen antes de copiar el
    // contexto y salir del cotizador.
    await this.page.waitForTimeout(0);
    this.activo = false;

    return {
      configuracion: obtenerConfiguracionSinCredenciales(escenario),
      campos: this.campos.map((campo) => ({ ...campo })),
      nombreTitular: confirmacion.nombreTitular,
      numeroPoliza: confirmacion.numeroPoliza,
    };
  }
}
