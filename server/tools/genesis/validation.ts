export type JsonRecord = Record<string, unknown>;

export const asRecord = (value: unknown, label: string): JsonRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`);
  }

  return value as JsonRecord;
};

export const readString = (record: JsonRecord, field: string, label: string): string => {
  const value = record[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label}.${field} must be a non-empty string`);
  }

  return value;
};

export const readArray = (record: JsonRecord, field: string, label: string): unknown[] => {
  const value = record[field];
  if (!Array.isArray(value)) throw new Error(`${label}.${field} must be an array`);
  return value;
};
