import { type ArgumentsHost, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';

function capturar(exception: unknown, acceptLanguage?: string) {
  const json = vi.fn((_body: unknown) => undefined);
  const status = vi.fn((_codigo: number) => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ headers: { 'accept-language': acceptLanguage } }),
    }),
  } as unknown as ArgumentsHost;
  new HttpExceptionFilter().catch(exception, host);
  return { status: status.mock.calls[0]?.[0] as unknown, body: json.mock.calls[0]?.[0] };
}

describe('HttpExceptionFilter', () => {
  it('responde con statusCode, error y message', () => {
    expect(capturar(new NotFoundException('Cliente no encontrado'))).toEqual({
      status: 404,
      body: { statusCode: 404, error: 'Not Found', message: 'Cliente no encontrado' },
    });
  });

  it('conserva los datos extra de un conflicto', () => {
    const { body } = capturar(
      new ConflictException({ message: 'Repetido', campo: 'cedula', clienteId: 'abc' }),
    );
    expect(body).toEqual({
      statusCode: 409,
      error: 'Conflict',
      message: 'Repetido',
      campo: 'cedula',
      clienteId: 'abc',
    });
  });

  it('oculta los detalles de un error inesperado', () => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    expect(capturar(new Error('fallo de conexión con secreto'))).toEqual({
      status: 500,
      body: {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error interno del servidor',
      },
    });
  });

  it('traduce el mensaje al portugués si se pide', () => {
    expect(capturar(new NotFoundException('Cliente no encontrado'), 'pt-PT').body).toMatchObject({
      message: 'Cliente não encontrado',
    });
  });

  it('convierte un duplicado de MongoDB en 409', () => {
    expect(capturar({ code: 11_000 }).status).toBe(409);
  });
});
