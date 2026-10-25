import configuration, { parseDuracion } from './configuration.js';

describe('parseDuracion', () => {
  it('convierte horas, minutos y segundos', () => {
    expect(parseDuracion('12h')).toBe(43_200);
    expect(parseDuracion('30m')).toBe(1800);
    expect(parseDuracion('90')).toBe(90);
  });

  it('rechaza un formato desconocido', () => {
    expect(() => parseDuracion('doce horas')).toThrow('Duración inválida');
  });
});

describe('configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('no arranca en producción sin JWT_SECRET', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', '');
    expect(() => configuration()).toThrow('JWT_SECRET');
  });

  it('no arranca en producción con un JWT_SECRET corto', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', 'corto');
    expect(() => configuration()).toThrow('JWT_SECRET');
  });

  it('usa un secreto de desarrollo fuera de producción', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('JWT_SECRET', '');
    expect(configuration().jwt.secret.length).toBeGreaterThanOrEqual(32);
  });
});
