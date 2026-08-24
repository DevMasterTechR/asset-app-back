// Cuando un activo se asigna a una persona con "código" propio (ej. Bryana =
// 406), el activo hereda ese número manteniendo su prefijo por tipo: una
// laptop con código "LAPT-001" pasa a "LAPT-406", un cargador "CARGL-001"
// pasa a "CARGL-406", etc. Si el código actual del activo no sigue el
// patrón "PREFIJO-numero" (formato inesperado, escrito a mano de otra
// forma), se deja tal cual: nunca se fuerza un cambio que pueda romper un
// código ya existente.
export function aplicarCodigoDePersona(assetCodeActual: string, codigoPersona: string): string {
  const actual = String(assetCodeActual || '');
  const match = /^(.*-)(\d+)$/.exec(actual);
  if (!match) return actual;

  const soloDigitos = String(codigoPersona || '').replace(/\D+/g, '');
  if (!soloDigitos) return actual;

  const numero = soloDigitos.padStart(3, '0');
  return `${match[1]}${numero}`;
}
