/**
 * ZAMORA usa 0 decimales (1 ZAM == 1 unidad). Estas utilidades existen para no
 * dispersar la constante por la app y facilitar un cambio futuro de decimales.
 */
export const ZAMORA_DECIMALS = 0;

export function toZamoraUnits(value: number): bigint {
  if (!Number.isFinite(value)) {
    throw new Error("Valor ZAMORA inválido");
  }
  return BigInt(Math.round(value));
}

export function fromZamoraUnits(value: bigint | number | string): number {
  return Number(value);
}

export function formatZamora(value: bigint | number | string): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 0 }).format(
    fromZamoraUnits(value),
  );
}
