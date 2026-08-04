import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface DatosLogPoliza {
  numeroFlujo: number;
  escenario: string;
  nombre: string;
  poliza: string;
}

export interface RegistroLogPoliza extends DatosLogPoliza {
  fechaHora: string;
}

export const RUTA_LOG_POLIZAS = path.resolve(
  __dirname,
  "../../Evidencias/polizas-generadas.json",
);

let colaEscrituras: Promise<void> = Promise.resolve();

function validarDatos(datos: DatosLogPoliza) {
  if (!Number.isInteger(datos.numeroFlujo) || datos.numeroFlujo <= 0) {
    throw new Error(
      `El número de flujo debe ser un entero positivo: ${datos.numeroFlujo}`,
    );
  }

  for (const [campo, valor] of Object.entries({
    escenario: datos.escenario,
    nombre: datos.nombre,
    poliza: datos.poliza,
  })) {
    if (!valor.trim()) {
      throw new Error(`No se puede guardar una póliza con ${campo} vacío`);
    }
  }
}

async function leerRegistros(rutaArchivo: string) {
  try {
    const contenido = await readFile(rutaArchivo, "utf8");
    const registros: unknown = JSON.parse(contenido);

    if (!Array.isArray(registros)) {
      throw new Error("el contenido raíz debe ser un arreglo");
    }

    return registros as RegistroLogPoliza[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    const detalle = error instanceof Error ? error.message : String(error);
    throw new Error(`No se pudo leer el log de pólizas: ${detalle}`);
  }
}

async function guardarRegistro(
  datos: DatosLogPoliza,
  rutaArchivo: string,
): Promise<RegistroLogPoliza> {
  validarDatos(datos);
  await mkdir(path.dirname(rutaArchivo), { recursive: true });

  const registros = await leerRegistros(rutaArchivo);
  const registroExistente = registros.find(
    (registro) => registro.poliza === datos.poliza,
  );

  if (registroExistente) {
    return registroExistente;
  }

  const registro: RegistroLogPoliza = {
    fechaHora: new Date().toISOString(),
    numeroFlujo: datos.numeroFlujo,
    escenario: datos.escenario.trim(),
    nombre: datos.nombre.trim(),
    poliza: datos.poliza.trim(),
  };
  const rutaTemporal = `${rutaArchivo}.${process.pid}.tmp`;
  const contenido = `${JSON.stringify([...registros, registro], null, 2)}\n`;

  await writeFile(rutaTemporal, contenido, "utf8");
  await rename(rutaTemporal, rutaArchivo);

  console.log(`Póliza guardada en ${rutaArchivo}: ${registro.poliza}`);
  return registro;
}

export function guardarLogPoliza(
  datos: DatosLogPoliza,
  rutaArchivo: string = RUTA_LOG_POLIZAS,
) {
  const operacion = colaEscrituras.then(() =>
    guardarRegistro(datos, rutaArchivo),
  );
  colaEscrituras = operacion.then(
    () => undefined,
    () => undefined,
  );
  return operacion;
}
