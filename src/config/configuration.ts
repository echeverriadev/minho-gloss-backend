export interface JwtConfig {
  secret: string;
  expiresInSeconds: number;
}

export interface AdminInicialConfig {
  email?: string;
  password?: string;
  nombre: string;
}

export interface MailConfig {
  host?: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  /** Orígenes permitidos por CORS (`CORS_ORIGIN`, separados por comas). */
  corsOrigins: string[];
  frontendUrl: string;
  jwt: JwtConfig;
  adminInicial: AdminInicialConfig;
  resetPasswordExpiresMinutes: number;
  mail: MailConfig;
  defaultCountryCode: string;
  /** Zona horaria del negocio para decidir a qué día pertenece cada atención (`APP_TIMEZONE`). */
  timeZone: string;
}

// Solo para desarrollo y pruebas: en producción se exige un JWT_SECRET propio (spec auth).
const DEV_JWT_SECRET = 'dev-secret-solo-para-desarrollo-no-usar-en-produccion';
const MIN_JWT_SECRET_LENGTH = 32;

// En desarrollo la app se puede abrir como localhost, 127.0.0.1 o la IP de la red local (celular).
const ORIGEN_DESARROLLO =
  /^https?:\/\/(localhost|127\.0\.0\.1|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2})(:\d+)?$/;

/** Si el navegador puede llamar a la API desde `origen` (spec api-architecture: solo `CORS_ORIGIN`). */
export function isOrigenPermitido(
  origen: string | undefined,
  config: Pick<AppConfig, 'corsOrigins' | 'nodeEnv'>,
): boolean {
  if (!origen) {
    return true; // peticiones sin navegador (curl, Swagger del mismo origen, pruebas)
  }
  if (config.corsOrigins.includes(origen)) {
    return true;
  }
  return config.nodeEnv !== 'production' && ORIGEN_DESARROLLO.test(origen);
}

const DURACION_SEGUNDOS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86_400 };

/** Convierte duraciones como `12h`, `30m` o `3600` a segundos. */
export function parseDuracion(valor: string): number {
  const match = /^(\d+)\s*([smhd]?)$/.exec(valor.trim());
  if (!match) {
    throw new Error(`Duración inválida "${valor}": usa por ejemplo 12h, 30m o 3600`);
  }
  const [, cantidad, unidad] = match;
  return Number(cantidad) * DURACION_SEGUNDOS[unidad || 's'];
}

function vacioComoUndefined(valor: string | undefined): string | undefined {
  return valor?.trim() ? valor.trim() : undefined;
}

function leerJwtSecret(nodeEnv: string): string {
  const secret = vacioComoUndefined(process.env.JWT_SECRET);
  if (nodeEnv === 'production' && (!secret || secret.length < MIN_JWT_SECRET_LENGTH)) {
    throw new Error(
      `JWT_SECRET es obligatorio en producción y debe tener al menos ${MIN_JWT_SECRET_LENGTH} caracteres`,
    );
  }
  return secret ?? DEV_JWT_SECRET;
}

export default (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return {
    nodeEnv,
    port: Number(process.env.PORT ?? 3000),
    mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/minho_gloss',
    corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origen) => origen.trim().replace(/\/+$/, ''))
      .filter(Boolean),
    frontendUrl: (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/+$/, ''),
    jwt: {
      secret: leerJwtSecret(nodeEnv),
      expiresInSeconds: parseDuracion(process.env.JWT_EXPIRES_IN ?? '12h'),
    },
    adminInicial: {
      email: vacioComoUndefined(process.env.ADMIN_EMAIL),
      password: vacioComoUndefined(process.env.ADMIN_PASSWORD),
      nombre: vacioComoUndefined(process.env.ADMIN_NOMBRE) ?? 'Administrador',
    },
    resetPasswordExpiresMinutes: Number(process.env.RESET_PASSWORD_EXPIRES_MINUTES ?? 60),
    mail: {
      host: vacioComoUndefined(process.env.SMTP_HOST),
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      user: vacioComoUndefined(process.env.SMTP_USER),
      pass: vacioComoUndefined(process.env.SMTP_PASS),
      from: process.env.MAIL_FROM ?? 'Minho Gloss <no-responder@minhogloss.local>',
    },
    defaultCountryCode: (process.env.DEFAULT_COUNTRY_CODE ?? '351').replace(/\D/g, ''),
    timeZone: vacioComoUndefined(process.env.APP_TIMEZONE) ?? 'Europe/Lisbon',
  };
};
