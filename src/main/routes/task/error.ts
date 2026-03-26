import * as cheerio from 'cheerio';
import { Response } from 'express';

export function handleRouteError(res: Response, html: any, message: any) {
  let bodyHtml = '';

  try {
    if (html) {
      const dom = cheerio.load(html);
      bodyHtml = dom('body').html() || '';
    }
  } catch (parseError) {
    console.error('Failed to parse response body as HTML:' + html);
    console.error('Error parsing response:', parseError);
  }

  console.error('Error:', message);

  return res.render('task/bodyHtml', {
    error: message || bodyHtml || 'Error.',
  });
}

// render the warning text as safe html
export function warning(expected: Number, actual: Number, data: any): string {
  return `Unexpected status code ${actual}. Expected ${expected}. <br><small>Response: ${data}</small>`;
}
