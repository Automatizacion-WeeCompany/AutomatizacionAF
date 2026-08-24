import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ResultadoAceptacionEmisionClaims } from "../types/EmisionClaims";
import { registrarInfo } from "./LoggerPruebas";

export const RUTA_LOG_EMISION_CLAIMS = path.resolve(
  __dirname,
  "../../Evidencias/emision-claims",
);

let consecutivoArchivo = 0;

function nombreSeguro(valor: string) {
  return valor.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function guardarLogEmisionClaims(
  resultado: ResultadoAceptacionEmisionClaims,
  directorio: string = RUTA_LOG_EMISION_CLAIMS,
) {
  const directorioPoliza = path.join(
    directorio,
    nombreSeguro(resultado.numeroPoliza),
  );
  await mkdir(directorioPoliza, { recursive: true });

  const marcaTiempo = resultado.fechaHora.replace(/[:.]/g, "-");
  const nombreArchivo = `${marcaTiempo}-${process.pid}-${consecutivoArchivo++}.json`;
  const rutaArchivo = path.join(directorioPoliza, nombreArchivo);

  await writeFile(rutaArchivo, `${JSON.stringify(resultado, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  registrarInfo(`Emisión Claims guardada en ${rutaArchivo}`);

  return rutaArchivo;
}
