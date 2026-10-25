const ENTIDADES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapa texto del usuario antes de ponerlo en el HTML de un correo. */
export function escapeHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter] ?? caracter);
}
