import request from 'supertest';
import { crearAppDePrueba, type AppDePrueba } from './utils/crear-app.js';

const CLIENTE = {
  nombre: 'Ana',
  apellido: 'Silva',
  cedula: '123456789',
  telefono: '912 345 678',
  email: 'ana.silva@example.com',
  direccion: 'Rua do Souto 25, Braga',
  fechaNacimiento: '1990-05-01',
  aceptaContacto: true,
};

describe('Atenciones (e2e)', () => {
  let t: AppDePrueba;
  let admin: { id: string; token: string };
  let empleado: { id: string; token: string };
  let fullGloss: string;
  let ozono: string;

  beforeAll(async () => {
    t = await crearAppDePrueba();
  });

  beforeEach(async () => {
    await t.limpiar();
    admin = await t.crearUsuario({ email: 'admin@minhogloss.pt', rol: 'admin' });
    empleado = await t.crearUsuario({ email: 'emp@minhogloss.pt' });
    fullGloss = (
      await http()
        .post('/api/tipos-servicio')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nombre: 'FULL GLOSS',
          categoria: 'servicio',
          modoPrecio: 'por-vehiculo',
          precios: { ligeiro: 2500, suv: 3000, monovolume: 3500, carrinha: 4000 },
        })
        .expect(201)
    ).body.id;
    ozono = (
      await http()
        .post('/api/tipos-servicio')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nombre: 'Higienização com ozono',
          categoria: 'extra',
          modoPrecio: 'unico',
          precioUnico: 1500,
        })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => {
    await t.cerrar();
  });

  const http = () => request(t.app.getHttpServer());
  const registrar = (datos: Record<string, unknown>, token = empleado.token) =>
    http().post('/api/atenciones').set('Authorization', `Bearer ${token}`).send(datos);

  it('registra una atención sin cliente con servicio y extra', async () => {
    const { body } = await registrar({
      tipoVehiculo: 'suv',
      placa: 'aa-12-bb',
      items: [{ tipoServicioId: fullGloss }, { tipoServicioId: ozono }],
      metodoPago: 'efectivo',
    }).expect(201);

    expect(body).toMatchObject({
      numero: 1,
      cliente: null,
      placa: 'AA12BB',
      total: 4500,
      estado: 'completada',
      registradoPor: { id: empleado.id, nombre: 'emp' },
    });
    expect(body.items).toEqual([
      expect.objectContaining({ nombre: 'FULL GLOSS', precioLista: 3000, precio: 3000 }),
      expect.objectContaining({ categoria: 'extra', precioLista: 1500, precio: 1500 }),
    ]);

    const segunda = await registrar({
      tipoVehiculo: 'ligeiro',
      items: [{ tipoServicioId: fullGloss }],
      metodoPago: 'tarjeta',
    }).expect(201);
    expect(segunda.body.numero).toBe(2);
  });

  it('el admin personaliza precios y el empleado recibe 403', async () => {
    const personalizada = {
      tipoVehiculo: 'ligeiro',
      items: [
        { tipoServicioId: fullGloss, precio: 2000 },
        { nombre: 'Limpieza de llantas', precio: 800 },
      ],
      metodoPago: 'mbway',
    };
    await registrar(personalizada).expect(403);
    const { body } = await registrar(personalizada, admin.token).expect(201);
    expect(body.total).toBe(2800);

    const catalogo = await http()
      .get(`/api/tipos-servicio/${fullGloss}/precio?tipoVehiculo=ligeiro`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(catalogo.body.precio).toBe(2500);
  });

  it('con cliente: detalle, contadores y anulación', async () => {
    const cliente = (
      await http()
        .post('/api/clientes')
        .set('Authorization', `Bearer ${empleado.token}`)
        .send(CLIENTE)
        .expect(201)
    ).body;

    const atencion = (
      await registrar({
        clienteId: cliente.id,
        tipoVehiculo: 'monovolume',
        items: [{ tipoServicioId: fullGloss }],
        metodoPago: 'efectivo',
      }).expect(201)
    ).body;

    const detalle = await http()
      .get(`/api/atenciones/${atencion.id}`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(200);
    expect(detalle.body.cliente).toMatchObject({
      nombre: 'Ana',
      telefono: '+351912345678',
      email: 'ana.silva@example.com',
    });

    const conServicio = await http()
      .get(`/api/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(200);
    expect(conServicio.body.totalServicios).toBe(1);
    expect(conServicio.body.ultimoServicioEn).toBe(atencion.realizadoEn);

    await http()
      .post(`/api/atenciones/${atencion.id}/anular`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .send({ motivo: 'Registrada dos veces' })
      .expect(403);
    const anulada = await http()
      .post(`/api/atenciones/${atencion.id}/anular`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ motivo: 'Registrada dos veces' })
      .expect(200);
    expect(anulada.body.anulacion).toMatchObject({
      motivo: 'Registrada dos veces',
      anuladoPor: { id: admin.id },
    });
    await http()
      .post(`/api/atenciones/${atencion.id}/anular`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ motivo: 'Otra vez' })
      .expect(409);

    const sinServicio = await http()
      .get(`/api/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(200);
    expect(sinServicio.body).toMatchObject({ totalServicios: 0, ultimoServicioEn: null });
  });

  it('lista el día con resumen y el empleado no ve otros días', async () => {
    await registrar({
      tipoVehiculo: 'suv',
      items: [{ tipoServicioId: fullGloss }],
      metodoPago: 'efectivo',
    }).expect(201);
    await registrar({
      tipoVehiculo: 'carrinha',
      items: [{ tipoServicioId: fullGloss }, { tipoServicioId: ozono }],
      metodoPago: 'tarjeta',
    }).expect(201);

    const { body } = await http()
      .get('/api/atenciones')
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(200);
    expect(body.total).toBe(2);
    expect(body.resumen).toEqual({ cantidad: 2, total: 3000 + 5500 });
    expect(body.items[0].tipoVehiculo).toBe('carrinha');

    await http()
      .get('/api/atenciones?desde=2020-01-01&hasta=2020-01-01')
      .set('Authorization', `Bearer ${empleado.token}`)
      .expect(403);
    const vacio = await http()
      .get('/api/atenciones?desde=2020-01-01&hasta=2020-01-01')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(vacio.body.resumen).toEqual({ cantidad: 0, total: 0 });
  });

  it('valida el cuerpo y responde en portugués', async () => {
    await registrar({ tipoVehiculo: 'suv', items: [], metodoPago: 'efectivo' })
      .set('Accept-Language', 'pt-PT')
      .expect(400)
      .expect((res) => expect(res.body.message).toContain('Adiciona pelo menos um serviço'));
    await registrar({
      tipoVehiculo: 'suv',
      items: [{ tipoServicioId: fullGloss }],
      metodoPago: 'efectivo',
      realizadoEn: new Date(Date.now() + 86_400_000).toISOString(),
    }).expect(400);
  });

  it('corrige el método de pago y las notas', async () => {
    const { body } = await registrar({
      tipoVehiculo: 'suv',
      items: [{ tipoServicioId: fullGloss }],
      metodoPago: 'efectivo',
    }).expect(201);

    const editada = await http()
      .patch(`/api/atenciones/${body.id}`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .send({ metodoPago: 'mbway', notas: 'Pagó por MB WAY' })
      .expect(200);
    expect(editada.body).toMatchObject({ metodoPago: 'mbway', notas: 'Pagó por MB WAY' });

    await http()
      .patch(`/api/atenciones/${body.id}`)
      .set('Authorization', `Bearer ${empleado.token}`)
      .send({ total: 1 })
      .expect(400);
  });
});
