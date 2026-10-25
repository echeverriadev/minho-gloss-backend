import request from 'supertest';
import { crearAppDePrueba, type AppDePrueba } from './utils/crear-app.js';

describe('Health (e2e)', () => {
  let t: AppDePrueba;

  beforeAll(async () => {
    t = await crearAppDePrueba();
  });

  afterAll(async () => {
    await t.cerrar();
  });

  it('GET /api/health es público', () => {
    return request(t.app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });
});
