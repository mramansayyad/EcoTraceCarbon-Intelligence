/**
 * Branded type for kilograms of CO2 equivalent.
 * Prevents mixing emission values with raw numbers.
 * @example
 * const emission = KgCO2e(21.5);
 * function display(e: KgCO2e): string { return `${e} kg CO₂e`; }
 */
declare const kgCO2eBrand: unique symbol;
export type KgCO2e = number & { readonly [kgCO2eBrand]: typeof kgCO2eBrand };
export const KgCO2e = (value: number): KgCO2e => {
  if (value < 0) throw new RangeError(`KgCO2e must be non-negative, got ${value}`);
  if (!Number.isFinite(value)) throw new TypeError(`KgCO2e must be finite`);
  return value as KgCO2e;
};

declare const kilometersBrand: unique symbol;
export type Kilometers = number & { readonly [kilometersBrand]: typeof kilometersBrand };
export const Kilometers = (value: number): Kilometers => {
  if (value <= 0) throw new RangeError(`Kilometers must be positive, got ${value}`);
  if (value > 40_075) throw new RangeError(`Kilometers exceeds Earth circumference`);
  return value as Kilometers;
};

declare const kWhBrand: unique symbol;
export type KWh = number & { readonly [kWhBrand]: typeof kWhBrand };
export const KWh = (value: number): KWh => {
  if (value < 0) throw new RangeError(`KWh must be non-negative, got ${value}`);
  return value as KWh;
};

declare const userIdBrand: unique symbol;
export type UserId = string & { readonly [userIdBrand]: typeof userIdBrand };
export const UserId = (value: string): UserId => {
  if (value.length === 0) throw new TypeError('UserId cannot be empty');
  if (!/^[a-zA-Z0-9_-]{20,128}$/.test(value))
    throw new TypeError(`Invalid UserId format: ${value}`);
  return value as UserId;
};
