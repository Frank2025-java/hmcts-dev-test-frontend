import type { Status } from './status';

export interface TaskDto {
  id?: string;                     // Omitted on creation
  title: string;                   // Required
  description: string | null;      // Optional
  status?: 'Initial' | 'Deleted';  // Optional on creation
  due?: string;                    // ISO-8601 date-time, optional on creation
}

export function taskDto(
    id: string | undefined,
    title: string,
    description: string | null = null,
    due: string,
    status: Status,
) : TaskDto {

  return {
    id,
    title,
    description,
    due,
    status
  };
};
