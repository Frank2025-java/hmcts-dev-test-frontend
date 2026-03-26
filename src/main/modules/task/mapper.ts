import type { TaskDto } from 'types/task.dto';
import { Status as statusEnum } from 'types/status';

// --- ISO date-time validation, not strict but recommended level by CoPilot ---
export const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

// Made a mistake in Java backend with TaskDto
// having a LocalDateTime instead of a ZonedDateTime
// Also, the date time entered by the user is the user’s local wall‑clock time
// <input .... type="datetime-local"
// and that even might not have seconds in the browser
export const localDateTimeOptionalSecondsRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

export function toDto(body: any): TaskDto {
  // --- Required field checks ---
  if (!body.title) {
    throw new Error('title is required');
  }

  let status: statusEnum | undefined;

  const allowedStatii = Object.values(statusEnum);

  if (body.status) {
    if (!allowedStatii.includes(body.status)) {
      throw new Error(`status must be one of: ${allowedStatii.join(', ')}`);
    } else {
      status = body.status;
    }
  } else {
    status = undefined;
  }

  let dueUtc: string;

  if (!body.due) {
    throw new Error('due is required');
  }

  if (typeof body.due !== 'string') {
    body.due = String(body.due);
  }

  if (localDateTimeOptionalSecondsRegex.test(body.due)) {
    dueUtc = new Date(body.due).toISOString();
  } else {
    if (isoDateTimeRegex.test(body.due)) {
      dueUtc = body.due;
    } else {
      const parsed = body.due ? '"' + body.due + '"' : 'null';
      throw new Error(parsed + ' must be a valid ISO date-time string');
    }
  }

  return {
    id: body.id ? String(body.id) : undefined,
    title: body.title,
    description: body.description ?? null,
    due: dueUtc,
    status,
  };
}

export function toDtoArray(data: any): TaskDto[] {
  if (Array.isArray(data)) {
    return data.map(item => toDto(item));
  } else {
    throw new Error('Expected array but got: ' + data);
  }
}
