import { toStatus } from 'types/status';
import type { TaskDto } from 'types/task.dto';

// ISO date-time validation (not leap year aware, but good enough for our purposes)
export const isoDateTimeRegex =
  /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9]|60)(\.\d+)?(Z|[+-](2[0-3]|[01][0-9]):[0-5][0-9])$/;

// The date time entered by the user is the user’s local wall‑clock time
// <input .... type="datetime-local"
// and that even might not have seconds in the browser
export const localDateTimeOptionalSecondsRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

export interface TaskFormInput {
  id?: string | number;
  title?: string;
  description?: string | null;
  due?: string | null;
  status?: string;
}

export function toDto(body: TaskFormInput): TaskDto {
  // --- Required field checks ---
  if (!body.title) {
    throw new Error('title is required');
  }

  if (!body.due) {
    throw new Error('due is required');
  }

  return {
    id: body.id ? String(body.id) : undefined,
    title: body.title,
    description: body.description ?? null,
    due: asIsoDateTime(body.due),
    status: body.status ? toStatus(body.status) : undefined,
  };
}

export function fromBackendDto(data: unknown): TaskDto {
  if (typeof data !== 'object' || data === null) {
    const dataStr = data === null ? 'null' : data === undefined ? 'undefined' : String(data);
    throw new Error(dataStr + ' is not of type TaskDto');
  }

  if (!('id' in data) || data.id === undefined) {
    throw new Error('id is required');
  }

  if (!('title' in data) || data.title === undefined) {
    throw new Error('title is required');
  }

  if (!('status' in data) || data.status === undefined) {
    throw new Error('status is required');
  }

  if (!('description' in data) || data.description === undefined) {
    throw new Error('description can be null, but should not be undefined');
  }
  if (!('due' in data) || data.due === undefined) {
    throw new Error('due is a required iso date time');
  }

  return {
    id: String(data.id),
    title: data.title as string,
    description: data.description as string,
    due: asIsoDateTime(data.due),
    status: toStatus(data.status),
  };
}

export function fromBackendDtoArray(data: unknown): TaskDto[] {
  if (Array.isArray(data)) {
    return data.map(item => fromBackendDto(item));
  } else {
    throw new Error('Expected array but got: ' + data);
  }
}

export function asIsoDateTime(input: unknown): string {
  // Normalise to string
  const value = typeof input === 'string' ? input : String(input);

  // Already proper ISO → accept as-is
  if (isoDateTimeRegex.test(value)) {
    return value;
  }

  // Local date-time → convert to UTC ISO
  if (localDateTimeOptionalSecondsRegex.test(value)) {
    return new Date(value).toISOString();
  }

  // Invalid → throw
  const parsed = value ? `"${value}"` : 'null';
  throw new Error(`${parsed} must be a valid ISO date-time string`);
}
