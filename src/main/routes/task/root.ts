import { load } from 'cheerio';
import { Application } from 'express';

import { TaskRestApiClient } from 'modules/task/backend';

import { renderRouteError } from './error';

export const routePath = '/task';

// /task root route (expecting to send back welcome html)
export default function (app: Application, api: TaskRestApiClient): void {
  app.get(routePath, async (req, res) => {
    let response = { data: '', status: 0 };

    try {
      response = await api.Root.call();

      try {
        // expecting html back. parse it and send body to view
        const dom = load(response.data);
        const bodyHtml = dom('body').html();

        // send body to view bodyHtml.njk
        res.render('task/bodyHtml', { bodyHtml });
      } catch (parseError: unknown) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse response body as HTML:' + response.data);
        // eslint-disable-next-line no-console
        console.error('Error parsing response:', parseError);
        renderRouteError(res, parseError);
      }
    } catch (error: unknown) {
      renderRouteError(res, error);
    }
  });
}
