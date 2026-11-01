import { HttpException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LimiteIntentosGuard, MENSAJE_LIMITE_INTENTOS } from './limite-intentos.guard.js';

function login() {
  return undefined;
}

function AuthController() {
  return undefined;
}

function contexto(ip: string, setHeader = vi.fn()): ExecutionContext {
  return {
    getHandler: () => login,
    getClass: () => AuthController,
    switchToHttp: () => ({ getRequest: () => ({ ip }), getResponse: () => ({ setHeader }) }),
  } as unknown as ExecutionContext;
}

function crearGuard(regla?: { limite: number; ventanaMs: number }) {
  const reflector = { get: vi.fn(() => regla) } as unknown as Reflector;
  return new LimiteIntentosGuard(reflector);
}

describe('LimiteIntentosGuard', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('deja pasar los endpoints sin límite', () => {
    const guard = crearGuard();
    for (let i = 0; i < 10; i++) {
      expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
    }
  });

  it('responde 429 con Retry-After al superar el límite', () => {
    const guard = crearGuard({ limite: 2, ventanaMs: 60_000 });
    const setHeader = vi.fn();
    expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
    expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
    let error: unknown;
    try {
      guard.canActivate(contexto('1.1.1.1', setHeader));
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(429);
    expect((error as HttpException).message).toBe(MENSAJE_LIMITE_INTENTOS);
    expect(setHeader).toHaveBeenCalledWith('Retry-After', '60');
  });

  it('cuenta cada IP por separado', () => {
    const guard = crearGuard({ limite: 1, ventanaMs: 60_000 });
    expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
    expect(guard.canActivate(contexto('2.2.2.2'))).toBe(true);
    expect(() => guard.canActivate(contexto('1.1.1.1'))).toThrow(HttpException);
  });

  it('vuelve a permitir cuando pasa la ventana', () => {
    vi.useFakeTimers();
    const guard = crearGuard({ limite: 1, ventanaMs: 60_000 });
    expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
    expect(() => guard.canActivate(contexto('1.1.1.1'))).toThrow(HttpException);
    vi.advanceTimersByTime(60_000);
    expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
  });
});
