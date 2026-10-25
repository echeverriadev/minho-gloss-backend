import request from 'supertest';
import { crearAppDePrueba, type AppDePrueba } from './utils/crear-app.js';

const FULL_GLOSS = {
  nombre: 'FULL GLOSS',
  descripcion: 'Lavagem completa do veículo',
  categoria: 'servicio',
  modoPrecio: 'por-vehiculo',
  precios: { ligeiro: 2500, suv: 3000, monovolume: 3500, carrinha: 4000 },
  orden: 3,
};

describe('Tipos de servicio (e2e)', () => {
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
  const crear = (datos: Record<string, unknown>, token = admin.token) =>
    http().post('/api/tipos-servicio').set('Authorization', `Bearer ${token}`).send(datos);

  it('el admin crea un servicio y cualquiera consulta su precio', async () => {
    const { body } = await crear(FULL_GLOSS).expect(201);
    expect(body).toMatchObject({ nombre: 'FULL GLOSS', precioUnico: null, activo: true });

    await http()
      .get(`/api/tipos-servicio/${body.id}/precio?tipoVehiculo=suv`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(200)
      .expect({ precio: 3000 });
    await http()
      .get(`/api/tipos-servicio/${body.id}/precio?tipoVehiculo=moto`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(400);
  });

  it('responde 400 si faltan precios y 409 si el título se repite', async () => {
    await crear({ ...FULL_GLOSS, precios: { ligeiro: 2500 } })
      .expect(400)
      .expect((res) => expect(res.body.message).toBe('Falta el precio para SUV'));
    await crear(FULL_GLOSS).expect(201);
    await crear({ ...FULL_GLOSS, nombre: 'full gloss' }).expect(409);
  });

  it('un empleado no puede crear ni editar el catálogo', async () => {
    await crear(FULL_GLOSS, empleado.token).expect(403);
  });

  it('lista primero los servicios y luego los extras, por orden', async () => {
    await crear({
      nombre: 'Lavagem do motor',
      categoria: 'extra',
      modoPrecio: 'unico',
      precioUnico: 4000,
    });
    await crear(FULL_GLOSS);
    await crear({ ...FULL_GLOSS, nombre: 'ASPIRAÇÃO', orden: 1 });

    const { body } = await http()
      .get('/api/tipos-servicio')
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(200);
    expect(body.map((tipo: { nombre: string }) => tipo.nombre)).toEqual([
      'ASPIRAÇÃO',
      'FULL GLOSS',
      'Lavagem do motor',
    ]);

    const extras = await http()
      .get('/api/tipos-servicio?categoria=extra')
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(200);
    expect(extras.body).toHaveLength(1);
  });

  it('la baja oculta el servicio y libera su título', async () => {
    const { body } = await crear(FULL_GLOSS).expect(201);
    await http()
      .delete(`/api/tipos-servicio/${body.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(204);

    const lista = await http()
      .get('/api/tipos-servicio')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(lista.body).toHaveLength(0);
    await crear(FULL_GLOSS).expect(201);
  });
});
