import configuration, { isOrigenPermitido, parseDuracion } from './configuration.js';

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

  it('toma MONGODB_URI de la integración de Atlas si no hay MONGO_URI', () => {
    vi.stubEnv('MONGO_URI', '');
    vi.stubEnv('MONGODB_URI', 'mongodb+srv://atlas.example.net/?retryWrites=true');
    vi.stubEnv('MONGO_DB_NAME', 'minho_gloss');
    expect(configuration().mongoUri).toBe('mongodb+srv://atlas.example.net/?retryWrites=true');
    expect(configuration().mongoDbName).toBe('minho_gloss');
  });

  it('prefiere MONGO_URI a MONGODB_URI', () => {
    vi.stubEnv('MONGO_URI', 'mongodb://mongo:27017/minho_gloss');
    vi.stubEnv('MONGODB_URI', 'mongodb+srv://atlas.example.net/');
    expect(configuration().mongoUri).toBe('mongodb://mongo:27017/minho_gloss');
  });

  it('usa un secreto de desarrollo fuera de producción', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('JWT_SECRET', '');
    expect(configuration().jwt.secret.length).toBeGreaterThanOrEqual(32);
  });
});

describe('isOrigenPermitido', () => {
  const corsOrigins = ['https://app.minhogloss.pt'];

  it('permite los orígenes de CORS_ORIGIN', () => {
    expect(
      isOrigenPermitido('https://app.minhogloss.pt', { corsOrigins, nodeEnv: 'production' }),
    ).toBe(true);
  });

  it('en desarrollo permite localhost, 127.0.0.1 y la red local', () => {
    const config = { corsOrigins, nodeEnv: 'development' };
    expect(isOrigenPermitido('http://127.0.0.1:5173', config)).toBe(true);
    expect(isOrigenPermitido('http://localhost:5173', config)).toBe(true);
    expect(isOrigenPermitido('http://192.168.1.20:5173', config)).toBe(true);
    expect(isOrigenPermitido('https://otro-sitio.com', config)).toBe(false);
  });

  it('en producción no permite orígenes locales', () => {
    expect(isOrigenPermitido('http://127.0.0.1:5173', { corsOrigins, nodeEnv: 'production' })).toBe(
      false,
    );
  });
});
