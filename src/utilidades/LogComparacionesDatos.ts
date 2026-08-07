import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ResultadoComparacionDatos } from "../types/ComparacionDatos";
import { registrarInfo } from "./LoggerPruebas";

export const RUTA_LOG_COMPARACIONES = path.resolve(
  __dirname,
  "../../Evidencias/comparaciones-datos",
);

let consecutivoArchivo = 0;

function nombreSeguro(valor: string) {
  return valor.replace(/[^a-zA-Z0-9_-]/g, "-");
}

/**
 * Genera un JSON independiente por ejecución. Así una corrida paralela no
 * reescribe un archivo consolidado y una diferencia conserva todo su detalle.
 */
export async function guardarLogComparacionDatos(
  resultado: ResultadoComparacionDatos,
  directorio: string = RUTA_LOG_COMPARACIONES,
) {
  const directorioPoliza = path.join(
    directorio,
    nombreSeguro(resultado.numeroPoliza),
  );
  await mkdir(directorioPoliza, { recursive: true });

  const marcaTiempo = resultado.fechaHora.replace(/[:.]/g, "-");
  const nombreArchivo = `${marcaTiempo}-${process.pid}-${consecutivoArchivo++}.json`;
  const rutaArchivo = path.join(directorioPoliza, nombreArchivo);
  const contenido = `${JSON.stringify(resultado, null, 2)}\n`;

  await writeFile(rutaArchivo, contenido, {
    encoding: "utf8",
    flag: "wx",
  });
  registrarInfo(`Comparación de datos guardada en ${rutaArchivo}`);

  return rutaArchivo;
}
