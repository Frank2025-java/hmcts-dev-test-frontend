import { Response } from 'express';

export function renderRouteError(res: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);

  // eslint-disable-next-line no-console
  console.error('Error:', message);

  return res.render('task/bodyHtml', {
    error: message || 'Error.',
  });
}

// render the warning text as safe html
export function warning(expected: number, actual: number, data: unknown): string {
  return `Unexpected status code ${actual}. Expected ${expected}. <br><small>Response: ${data}</small>`;
}
