/**
 * Normaliza un teléfono a E.164: quita separadores, convierte `00` inicial en `+`
 * y agrega el código de país por defecto si falta. Devuelve `null` si no es válido.
 */
export function normalizarTelefono(texto: string, codigoPais: string): string | null {
  const limpio = texto.trim().replace(/[\s\-.()/]/g, '');
  const conMas = limpio.startsWith('00') ? `+${limpio.slice(2)}` : limpio;
  if (!/^\+?\d+$/.test(conMas)) {
    return null;
  }
  const completo = conMas.startsWith('+') ? conMas : `+${codigoPais}${conMas}`;
  const digitos = completo.length - 1;
  return digitos >= 8 && digitos <= 15 ? completo : null;
}

/** Normaliza un documento de identidad: mayúsculas sin espacios, puntos ni guiones. */
export function normalizarCedula(texto: string): string {
  return texto
    .trim()
    .toUpperCase()
    .replace(/[\s.\-/]/g, '');
}

/** Pasa a minúsculas y quita tildes para buscar sin distinguirlas ("José" → "jose"). */
export function normalizarTextoBusqueda(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Escapa un texto para usarlo literalmente dentro de una expresión regular. */
export function escapeRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
