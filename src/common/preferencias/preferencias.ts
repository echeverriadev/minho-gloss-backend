export const IDIOMAS = ['es', 'pt-PT'] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const TEMAS = ['claro', 'oscuro'] as const;
export type Tema = (typeof TEMAS)[number];

export interface Preferencias {
  idioma: Idioma;
  tema: Tema;
}

export const PREFERENCIAS_POR_DEFECTO: Preferencias = { idioma: 'es', tema: 'claro' };
