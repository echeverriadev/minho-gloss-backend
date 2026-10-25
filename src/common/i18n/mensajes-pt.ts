/**
 * Traducción al portugués de Portugal de los mensajes que la API devuelve en español
 * (spec auth: mensajes en el idioma del usuario). Lo que no está aquí se devuelve en español.
 */
export const MENSAJES_PT: Readonly<Record<string, string>> = {
  // Sesión y permisos
  'Correo o contraseña incorrectos': 'Email ou palavra-passe incorretos',
  'Debes iniciar sesión': 'Tens de iniciar sessão',
  'La sesión venció, inicia sesión de nuevo': 'A sessão expirou, inicia sessão novamente',
  'La sesión no es válida, inicia sesión de nuevo':
    'A sessão não é válida, inicia sessão novamente',
  'No tienes permiso para esta acción': 'Não tens permissão para esta ação',
  'Demasiados intentos, espera un minuto': 'Demasiadas tentativas, aguarda um minuto',
  'Demasiadas solicitudes, espera un momento': 'Demasiados pedidos, aguarda um momento',
  'La contraseña actual no es correcta': 'A palavra-passe atual não está correta',
  'El enlace no es válido o ya venció, pide uno nuevo':
    'A ligação não é válida ou já expirou, pede uma nova',
  'El token debe ser un texto': 'O token deve ser um texto',
  'El token es obligatorio': 'O token é obrigatório',
  'El token no es válido': 'O token não é válido',
  'La contraseña actual debe ser un texto': 'A palavra-passe atual deve ser um texto',
  'La contraseña actual es obligatoria': 'A palavra-passe atual é obrigatória',
  'La contraseña es obligatoria': 'A palavra-passe é obrigatória',
  // Usuarios
  'Ya existe un usuario con ese correo': 'Já existe um utilizador com esse email',
  'Debe quedar al menos un administrador activo': 'Tem de ficar pelo menos um administrador ativo',
  'No puedes desactivar tu propia cuenta': 'Não podes desativar a tua própria conta',
  'Usuario no encontrado': 'Utilizador não encontrado',
  'El nombre debe ser un texto': 'O nome deve ser um texto',
  'El nombre debe tener entre 2 y 80 caracteres': 'O nome deve ter entre 2 e 80 caracteres',
  'El rol debe ser admin o empleado': 'A função deve ser admin ou empleado',
  'El idioma debe ser es o pt-PT': 'O idioma deve ser es ou pt-PT',
  'El tema debe ser claro u oscuro': 'O tema deve ser claro ou oscuro',
  // Clientes
  'Cliente no encontrado': 'Cliente não encontrado',
  'El cliente ya fue anonimizado': 'O cliente já foi anonimizado',
  'El nombre debe tener entre 2 y 60 caracteres': 'O nome deve ter entre 2 e 60 caracteres',
  'El apellido debe ser un texto': 'O apelido deve ser um texto',
  'El apellido debe tener entre 2 y 60 caracteres': 'O apelido deve ter entre 2 e 60 caracteres',
  'La cédula debe ser un texto': 'O documento de identificação deve ser um texto',
  'La cédula debe tener entre 4 y 20 letras o números':
    'O documento de identificação deve ter entre 4 e 20 letras ou números',
  'El teléfono no es válido': 'O telemóvel não é válido',
  'El teléfono no es válido: usa entre 8 y 15 dígitos, por ejemplo 912 345 678':
    'O telemóvel não é válido: usa entre 8 e 15 dígitos, por exemplo 912 345 678',
  'El correo no es válido': 'O email não é válido',
  'El correo no puede superar los 120 caracteres': 'O email não pode ter mais de 120 caracteres',
  'La dirección debe ser un texto': 'A morada deve ser um texto',
  'La dirección debe tener entre 5 y 200 caracteres': 'A morada deve ter entre 5 e 200 caracteres',
  'La fecha de nacimiento no puede ser futura': 'A data de nascimento não pode ser no futuro',
  'La fecha de nacimiento debe ser una fecha válida con formato AAAA-MM-DD, posterior a 1900':
    'A data de nascimento deve ser uma data válida no formato AAAA-MM-DD, posterior a 1900',
  'aceptaContacto debe ser true o false': 'aceptaContacto deve ser true ou false',
  'Las notas deben ser un texto': 'As notas devem ser um texto',
  'Las notas no pueden superar los 500 caracteres': 'As notas não podem ter mais de 500 caracteres',
  // Catálogo
  'Servicio no encontrado': 'Serviço não encontrado',
  'Falta el precio único': 'Falta o preço único',
  'El título debe ser un texto': 'O título deve ser um texto',
  'El título debe tener entre 2 y 60 caracteres': 'O título deve ter entre 2 e 60 caracteres',
  'La descripción debe ser un texto': 'A descrição deve ser um texto',
  'La descripción no puede superar los 300 caracteres':
    'A descrição não pode ter mais de 300 caracteres',
  'La categoría debe ser servicio o extra': 'A categoria deve ser servicio ou extra',
  'El modo de precio debe ser por-vehiculo o unico':
    'O modo de preço deve ser por-vehiculo ou unico',
  'Los precios deben ser enteros en céntimos, 0 o mayores':
    'Os preços devem ser inteiros em cêntimos, 0 ou mais',
  'El orden debe ser un número entero': 'A ordem deve ser um número inteiro',
  'El orden debe ser 0 o mayor': 'A ordem deve ser 0 ou maior',
  'El tipo de vehículo debe ser ligeiro, suv, monovolume o carrinha':
    'O tipo de veículo deve ser ligeiro, suv, monovolume ou carrinha',
  // Atenciones
  'Atención no encontrada': 'Atendimento não encontrado',
  'La fecha de la atención no puede estar en el futuro':
    'A data do atendimento não pode ser no futuro',
  'La fecha de la atención no es válida': 'A data do atendimento não é válida',
  'Solo un administrador puede registrar atenciones de días anteriores':
    'Só um administrador pode registar atendimentos de dias anteriores',
  'Solo un administrador puede ver atenciones de otros días':
    'Só um administrador pode ver atendimentos de outros dias',
  'Solo un administrador puede editar atenciones de días anteriores':
    'Só um administrador pode editar atendimentos de dias anteriores',
  'Solo un administrador puede cambiar precios o agregar servicios personalizados':
    'Só um administrador pode alterar preços ou adicionar serviços personalizados',
  'Los servicios personalizados necesitan nombre y precio':
    'Os serviços personalizados precisam de nome e preço',
  'La atención ya está anulada': 'O atendimento já está anulado',
  'La atención está anulada y no se puede editar':
    'O atendimento está anulado e não pode ser editado',
  'La fecha desde no puede ser posterior a hasta': 'A data desde não pode ser posterior à data até',
  'El servicio no es válido': 'O serviço não é válido',
  'El cliente no es válido': 'O cliente não é válido',
  'El nombre del servicio debe ser un texto': 'O nome do serviço deve ser um texto',
  'El nombre del servicio debe tener entre 2 y 60 caracteres':
    'O nome do serviço deve ter entre 2 e 60 caracteres',
  'El precio debe ser un entero en céntimos, 0 o mayor':
    'O preço deve ser um inteiro em cêntimos, 0 ou mais',
  'La placa debe ser un texto': 'A matrícula deve ser um texto',
  'La placa debe tener entre 2 y 12 letras o números':
    'A matrícula deve ter entre 2 e 12 letras ou números',
  'Agrega al menos un servicio': 'Adiciona pelo menos um serviço',
  'Una atención puede tener hasta 20 servicios': 'Um atendimento pode ter até 20 serviços',
  'El método de pago debe ser efectivo, tarjeta, mbway, transferencia u otro':
    'O método de pagamento deve ser efectivo, tarjeta, mbway, transferencia ou otro',
  'Las notas no pueden superar los 300 caracteres': 'As notas não podem ter mais de 300 caracteres',
  'El motivo es obligatorio': 'O motivo é obrigatório',
  'El motivo debe tener entre 3 y 200 caracteres': 'O motivo deve ter entre 3 e 200 caracteres',
  'desde debe ser una fecha AAAA-MM-DD': 'desde deve ser uma data AAAA-MM-DD',
  'hasta debe ser una fecha AAAA-MM-DD': 'hasta deve ser uma data AAAA-MM-DD',
  'El estado debe ser completada o anulada': 'O estado deve ser completada ou anulada',
  // Generales
  'El id no es válido': 'O id não é válido',
  'Recurso no encontrado': 'Recurso não encontrado',
  'Ya existe un registro con esos datos': 'Já existe um registo com esses dados',
  'Error interno del servidor': 'Erro interno do servidor',
  'page debe ser un número entero': 'page deve ser um número inteiro',
  'page debe ser 1 o mayor': 'page deve ser 1 ou maior',
  'limit debe ser un número entero': 'limit deve ser um número inteiro',
  'limit debe ser 1 o mayor': 'limit deve ser 1 ou maior',
  'limit no puede ser mayor que 100': 'limit não pode ser maior que 100',
  'q debe ser un texto': 'q deve ser um texto',
  'q no puede superar los 100 caracteres': 'q não pode ter mais de 100 caracteres',
  'sort debe ser un texto': 'sort deve ser um texto',
  'incluirInactivos debe ser true o false': 'incluirInactivos deve ser true ou false',
  'activo debe ser true o false': 'activo deve ser true ou false',
};

const TIPOS_VEHICULO_PT: Readonly<Record<string, string>> = {
  Ligeiro: 'Ligeiro',
  SUV: 'SUV',
  Monovolume: 'Monovolume',
  Carrinha: 'Carrinha',
};

/** Mensajes con datos variables: patrón en español y su traducción. */
const PATRONES_PT: readonly [RegExp, (...grupos: string[]) => string][] = [
  [
    /^El teléfono ya está registrado para (.+)$/,
    (nombre) => `O telemóvel já está registado para ${nombre}`,
  ],
  [
    /^La cédula ya está registrada para (.+)$/,
    (nombre) => `O documento de identificação já está registado para ${nombre}`,
  ],
  [/^Ya existe un servicio llamado (.+)$/, (nombre) => `Já existe um serviço chamado ${nombre}`],
  [
    /^El servicio (.+) ya no está disponible$/,
    (nombre) => `O serviço ${nombre} já não está disponível`,
  ],
  [
    /^Falta el precio para (.+)$/,
    (tipo) => `Falta o preço para ${TIPOS_VEHICULO_PT[tipo] ?? tipo}`,
  ],
  [
    /^La propiedad (.+) no está permitida$/,
    (propiedad) => `A propriedade ${propiedad} não é permitida`,
  ],
  [
    /^(La contraseña|La contraseña nueva) debe ser un texto$/,
    (campo) => `${campoPassword(campo)} deve ser um texto`,
  ],
  [
    /^(La contraseña|La contraseña nueva) debe tener al menos (\d+) caracteres$/,
    (campo, minimo) => `${campoPassword(campo)} deve ter pelo menos ${minimo} caracteres`,
  ],
  [
    /^(La contraseña|La contraseña nueva) no puede superar los (\d+) caracteres$/,
    (campo, maximo) => `${campoPassword(campo)} não pode ter mais de ${maximo} caracteres`,
  ],
];

function campoPassword(campo: string): string {
  return campo === 'La contraseña nueva' ? 'A nova palavra-passe' : 'A palavra-passe';
}

/** Traduce un mensaje de la API al portugués; si no hay traducción, lo devuelve igual. */
export function traducirPt(mensaje: string): string {
  const exacto = MENSAJES_PT[mensaje];
  if (exacto) {
    return exacto;
  }
  for (const [patron, traducir] of PATRONES_PT) {
    const match = patron.exec(mensaje);
    if (match) {
      return traducir(...match.slice(1));
    }
  }
  return mensaje;
}

/** `Accept-Language` que empieza por `pt` pide los mensajes en portugués. */
export function prefierePortugues(acceptLanguage: string | undefined): boolean {
  return acceptLanguage?.trim().toLowerCase().startsWith('pt') ?? false;
}
