export interface TaskDto {
  id?: string;               // Omitted on creation
  title: string;             // Required
  description?: string;      // Optional
  status?: "Initial" | "Deleted"; // Optional on creation
  due?: string;              // ISO-8601 date-time, optional on creation
}