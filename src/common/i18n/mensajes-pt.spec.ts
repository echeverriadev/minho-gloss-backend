import { prefierePortugues, traducirPt } from './mensajes-pt.js';

describe('traducirPt', () => {
  it('traduce mensajes fijos', () => {
    expect(traducirPt('Correo o contraseña incorrectos')).toBe('Email ou palavra-passe incorretos');
  });

  it('traduce mensajes con datos', () => {
    expect(traducirPt('La cédula ya está registrada para Ana Silva')).toBe(
      'O documento de identificação já está registado para Ana Silva',
    );
    expect(traducirPt('Falta el precio para Carrinha')).toBe('Falta o preço para Carrinha');
    expect(traducirPt('La contraseña nueva debe tener al menos 8 caracteres')).toBe(
      'A nova palavra-passe deve ter pelo menos 8 caracteres',
    );
    expect(traducirPt('La propiedad rol no está permitida')).toBe(
      'A propriedade rol não é permitida',
    );
  });

  it('deja en español lo que no tiene traducción', () => {
    expect(traducirPt('Mensaje nuevo sin traducir')).toBe('Mensaje nuevo sin traducir');
  });
});

describe('prefierePortugues', () => {
  it('detecta pt en Accept-Language', () => {
    expect(prefierePortugues('pt-PT')).toBe(true);
    expect(prefierePortugues('pt-PT,pt;q=0.9,en;q=0.8')).toBe(true);
    expect(prefierePortugues('es-ES,es;q=0.9')).toBe(false);
    expect(prefierePortugues(undefined)).toBe(false);
  });
});
