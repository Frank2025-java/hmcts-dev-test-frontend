import * as cheerio from 'cheerio';
import { Response } from 'express';

export function handleRouteError(res: Response, response: any, error: any) {
  let bodyHtml = '';

  try {
    if (response?.data) {
      const dom = cheerio.load(response.data);
      bodyHtml = dom('body').html() || '';
    }
  } catch (parseError) {
    console.error('Failed to parse response body as HTML:' + response?.data);
    console.error('Error parsing response:', parseError);
  }

  console.error('Error:', error);

  return res.render('task/bodyHtml', {
    error: error?.message || bodyHtml || 'Error.',
  });
}
