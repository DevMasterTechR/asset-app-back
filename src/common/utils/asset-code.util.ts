// Cuando un activo se asigna a una persona con "código" propio (ej. Bryana =
// 406), el activo hereda ese número manteniendo su prefijo por tipo: una
// laptop con código "LAPT-001" pasa a "LAPT-406", un cargador "CARGL-001"
// pasa a "CARGL-406", etc. Si el código actual del activo no sigue el
// patrón "PREFIJO-numero" (formato inesperado, escrito a mano de otra
// forma), se deja tal cual: nunca se fuerza un cambio que pueda romper un
// código ya existente.
export function aplicarCodigoDePersona(assetCodeActual: string, codigoPersona: string): string {
  const actual = String(assetCodeActual || '');
  // Tolera espacios alrededor del guion ("LAPT - 081"), formato en el que
  // quedaron algunos códigos cargados a mano: sin esto, esos activos nunca
  // se renombraban al cambiar el código de su dueño y terminaban duplicados
  // (uno viejo con el número anterior, otro nuevo en blanco con el correcto).
  const match = /^(.*?)\s*-\s*(\d+)$/.exec(actual);
  if (!match) return actual;

  const soloDigitos = String(codigoPersona || '').replace(/\D+/g, '');
  if (!soloDigitos) return actual;

  const numero = soloDigitos.padStart(3, '0');
  // Siempre se devuelve en el formato canónico sin espacios ("LAPT-406"),
  // corrigiendo el formato de una vez de paso.
  return `${match[1]}-${numero}`;
}
