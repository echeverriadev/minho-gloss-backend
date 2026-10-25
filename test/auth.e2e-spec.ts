import request from 'supertest';
import { crearAppDePrueba, type AppDePrueba } from './utils/crear-app.js';

describe('Auth y usuarios (e2e)', () => {
  let t: AppDePrueba;

  beforeAll(async () => {
    t = await crearAppDePrueba();
  });

  beforeEach(async () => {
    await t.limpiar();
  });

  afterAll(async () => {
    await t.cerrar();
  });

  const http = () => request(t.app.getHttpServer());

  it('inicia sesión y consulta el usuario de la sesión', async () => {
    await t.crearUsuario({ email: 'ana@minhogloss.pt', rol: 'admin' });

    const login = await http()
      .post('/api/auth/login')
      .send({ email: 'ANA@minhogloss.pt', password: 'ClaveSegura2026' })
      .expect(200);

    expect(login.body).toMatchObject({
      expiresIn: 43_200,
      usuario: { email: 'ana@minhogloss.pt' },
    });
    await http()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200)
      .expect((res) => expect(res.body.rol).toBe('admin'));
  });

  it('responde 401 con el mensaje genérico si la contraseña es incorrecta', async () => {
    await t.crearUsuario({ email: 'ana@minhogloss.pt' });

    const res = await http()
      .post('/api/auth/login')
      .send({ email: 'ana@minhogloss.pt', password: 'otra-clave' })
      .expect(401);
    expect(res.body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Correo o contraseña incorrectos',
    });
  });

  it('responde 401 sin token y 403 a un empleado en /api/usuarios', async () => {
    const empleado = await t.crearUsuario({ email: 'emp@minhogloss.pt' });

    await http().get('/api/usuarios').expect(401);
    await http().post('/api/usuarios').send({}).expect(401);
    const res = await http()
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(403);
    expect(res.body.message).toBe('No tienes permiso para esta acción');
  });

  it('el admin crea un empleado que luego puede iniciar sesión', async () => {
    const admin = await t.crearUsuario({ email: 'admin@minhogloss.pt', rol: 'admin' });

    await http()
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        nombre: 'Rui',
        email: 'rui@minhogloss.pt',
        password: 'ClaveRui2026',
        rol: 'empleado',
      })
      .expect(201)
      .expect((res) => expect(res.body).not.toHaveProperty('passwordHash'));

    await http()
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        nombre: 'Rui',
        email: 'RUI@minhogloss.pt',
        password: 'ClaveRui2026',
        rol: 'empleado',
      })
      .expect(409);

    await http()
      .post('/api/auth/login')
      .send({ email: 'rui@minhogloss.pt', password: 'ClaveRui2026' })
      .expect(200);
  });

  it('valida en español y rechaza propiedades no permitidas', async () => {
    const admin = await t.crearUsuario({ email: 'admin@minhogloss.pt', rol: 'admin' });

    const res = await http()
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ nombre: 'R', email: 'no-es-correo', password: 'corta', rol: 'jefe', extra: 1 })
      .expect(400);
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        'La propiedad extra no está permitida',
        'El nombre debe tener entre 2 y 80 caracteres',
        'El correo no es válido',
        'La contraseña debe tener al menos 8 caracteres',
        'El rol debe ser admin o empleado',
      ]),
    );
  });

  it('corta la sesión de un usuario desactivado', async () => {
    const admin = await t.crearUsuario({ email: 'admin@minhogloss.pt', rol: 'admin' });
    const empleado = await t.crearUsuario({ email: 'emp@minhogloss.pt' });

    await http()
      .delete(`/api/usuarios/${empleado.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(204);
    await http().get('/api/auth/me').set('Authorization', `Bearer ${empleado.token}`).expect(401);
  });

  it('no deja al negocio sin administrador activo', async () => {
    const admin = await t.crearUsuario({ email: 'admin@minhogloss.pt', rol: 'admin' });

    const res = await http()
      .patch(`/api/usuarios/${admin.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ rol: 'empleado' })
      .expect(409);
    expect(res.body.message).toBe('Debe quedar al menos un administrador activo');
  });

  it('recupera la contraseña con el enlace del correo, una sola vez', async () => {
    await t.crearUsuario({ email: 'ana@minhogloss.pt' });

    await http().post('/api/auth/recuperar-password').send({ email: 'nadie@x.pt' }).expect(204);
    expect(t.correos).toHaveLength(0);

    await http()
      .post('/api/auth/recuperar-password')
      .send({ email: 'ana@minhogloss.pt' })
      .expect(204);
    expect(t.correos).toHaveLength(1);
    const token = /token=([a-f0-9]+)/.exec(t.correos[0].texto)?.[1];

    await http()
      .post('/api/auth/restablecer-password')
      .send({ token, password: 'NuevaClave2026' })
      .expect(204);
    await http()
      .post('/api/auth/restablecer-password')
      .send({ token, password: 'OtraClave2026' })
      .expect(400)
      .expect((res) =>
        expect(res.body.message).toBe('El enlace no es válido o ya venció, pide uno nuevo'),
      );

    await http()
      .post('/api/auth/login')
      .send({ email: 'ana@minhogloss.pt', password: 'NuevaClave2026' })
      .expect(200);
  });

  it('cambia la propia contraseña', async () => {
    const ana = await t.crearUsuario({ email: 'ana@minhogloss.pt' });

    await http()
      .post('/api/auth/cambiar-password')
      .set('Authorization', `Bearer ${ana.token}`)
      .send({ passwordActual: 'mal', passwordNueva: 'NuevaClave2026' })
      .expect(400);
    await http()
      .post('/api/auth/cambiar-password')
      .set('Authorization', `Bearer ${ana.token}`)
      .send({ passwordActual: 'ClaveSegura2026', passwordNueva: 'NuevaClave2026' })
      .expect(204);
  });

  // Va al final: agota el límite de intentos de login de esta IP.
  it('responde 429 al sexto intento de login en un minuto', async () => {
    for (let intento = 0; intento < 5; intento++) {
      // oxlint-disable-next-line no-await-in-loop -- los intentos deben ser secuenciales
      await http().post('/api/auth/login').send({ email: 'x@x.pt', password: '12345678' });
    }
    const res = await http()
      .post('/api/auth/login')
      .send({ email: 'x@x.pt', password: '12345678' })
      .expect(429);
    expect(res.body.message).toBe('Demasiados intentos, espera un minuto');
  });
});
