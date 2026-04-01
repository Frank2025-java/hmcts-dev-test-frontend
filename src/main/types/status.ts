export enum Status {
  Init = 'Initial',
  Deleted = 'Deleted',
}

export function toStatus(value: unknown): Status {
  if (typeof value !== 'string') {
    throw new Error(`Status must be a string, got ${typeof value}`);
  }

  const allowed = Object.values(Status);

  if (allowed.includes(value as Status)) {
    return value as Status;
  }

  throw new Error(`Invalid status "${value}". Must be one of: ${allowed.join(', ')}`);
}
