import request from 'supertest';
import { crearAppDePrueba, type AppDePrueba } from './utils/crear-app.js';

const CLIENTE = {
  nombre: 'José',
  apellido: 'Pérez',
  cedula: '12345678 9 zz4',
  telefono: '912 345 678',
  email: 'Jose@Example.com',
  direccion: 'Rua do Souto 25, Braga',
  fechaNacimiento: '1985-04-12',
  aceptaContacto: true,
};

describe('Clientes (e2e)', () => {
  let t: AppDePrueba;
  let admin: { id: string; token: string };
  let empleado: { id: string; token: string };

  beforeAll(async () => {
    t = await crearAppDePrueba();
  });

  beforeEach(async () => {
    await t.limpiar();
    admin = await t.crearUsuario({ email: 'admin@minhogloss.pt', rol: 'admin' });
    empleado = await t.crearUsuario({ email: 'emp@minhogloss.pt' });
  });

  afterAll(async () => {
    await t.cerrar();
  });

  const http = () => request(t.app.getHttpServer());
  const crear = (datos: Record<string, unknown> = CLIENTE) =>
    http().post('/api/clientes').set('Authorization', `Bearer ${empleado.token}`).send(datos);

  it('responde 401 sin sesión', async () => {
    await http().get('/api/clientes').expect(401);
  });

  it('crea un cliente con teléfono y cédula normalizados', async () => {
    const res = await crear().expect(201);
    expect(res.body).toMatchObject({
      nombre: 'José',
      apellido: 'Pérez',
      cedula: '123456789ZZ4',
      telefono: '+351912345678',
      email: 'jose@example.com',
      fechaNacimiento: '1985-04-12',
      activo: true,
      totalServicios: 0,
    });
  });

  it('responde 409 con el cliente existente si la cédula se repite', async () => {
    const primero = await crear().expect(201);

    const res = await crear({ ...CLIENTE, telefono: '913 000 000', cedula: '123456789ZZ4' }).expect(
      409,
    );
    expect(res.body).toMatchObject({
      message: 'La cédula ya está registrada para José Pérez',
      campo: 'cedula',
      clienteId: primero.body.id,
    });
  });

  it('valida campos obligatorios y la fecha de nacimiento', async () => {
    const res = await crear({
      nombre: 'J',
      fechaNacimiento: '2999-01-01',
      aceptaContacto: 'si',
    }).expect(400);
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        'El nombre debe tener entre 2 y 60 caracteres',
        'La fecha de nacimiento no puede ser futura',
        'La cédula debe tener entre 4 y 20 letras o números',
        'El correo no es válido',
      ]),
    );
  });

  it('busca por nombre sin tilde, por teléfono y por cédula', async () => {
    await crear().expect(201);
    await crear({
      ...CLIENTE,
      nombre: 'Ana',
      apellido: 'Silva',
      cedula: '987654321',
      telefono: '934 111 222',
    }).expect(201);

    for (const [q, esperado] of [
      ['jose', 'José'],
      ['silv', 'Ana'],
      ['912 34', 'José'],
      ['98765', 'Ana'],
    ]) {
      // oxlint-disable-next-line no-await-in-loop -- casos de búsqueda independientes y legibles en orden
      const res = await http()
        .get('/api/clientes')
        .query({ q })
        .set('Authorization', `Bearer ${empleado.token}`)
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.items[0].nombre).toBe(esperado);
    }
  });

  it('pagina y ordena por apellido', async () => {
    await crear({ ...CLIENTE, apellido: 'Zapata', cedula: 'Z1111', telefono: '911 111 111' });
    await crear({ ...CLIENTE, apellido: 'Abreu', cedula: 'A2222', telefono: '922 222 222' });

    const res = await http()
      .get('/api/clientes?limit=1')
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(200);
    expect(res.body).toMatchObject({ total: 2, page: 1, limit: 1 });
    expect(res.body.items[0].apellido).toBe('Abreu');
  });

  it('edita un cliente', async () => {
    const { body } = await crear().expect(201);

    await http()
      .patch(`/api/clientes/${body.id}`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .send({ direccion: 'Avenida da Liberdade 1, Braga', aceptaContacto: false })
      .expect(200)
      .expect((res) => expect(res.body).toMatchObject({ aceptaContacto: false }));
  });

  it('solo el admin da de baja y la ficha deja de verse', async () => {
    const { body } = await crear().expect(201);

    await http()
      .delete(`/api/clientes/${body.id}`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(403);
    await http()
      .delete(`/api/clientes/${body.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(204);
    await http()
      .get(`/api/clientes/${body.id}`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(404);
    // Un cliente dado de baja no bloquea reutilizar su cédula y teléfono.
    await crear().expect(201);
  });

  it('anonimiza a un cliente (RGPD)', async () => {
    const { body } = await crear().expect(201);

    await http()
      .post(`/api/clientes/${body.id}/anonimizar`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(204);
    await http()
      .post(`/api/clientes/${body.id}/anonimizar`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(409);

    const ficha = await http()
      .get(`/api/clientes/${body.id}?incluirInactivos=true`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(ficha.body).toMatchObject({
      nombre: 'Cliente',
      apellido: 'eliminado',
      cedula: null,
      telefono: null,
      email: null,
      direccion: null,
      fechaNacimiento: null,
      anonimizado: true,
    });
  });

  it('responde 400 con un id inválido', async () => {
    await http()
      .get('/api/clientes/123')
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(400);
  });
});
