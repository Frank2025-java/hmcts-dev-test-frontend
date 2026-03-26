import { Application } from 'express';
import { load } from 'cheerio';

import { TaskRestApiClient } from 'modules/task/backend';
import { handleRouteError } from './error';

export const routePath = '/task';

// /task root route (expecting to send back welcome html)
export default function (app: Application, api: TaskRestApiClient): void {
  app.get(routePath, async (req, res) => {
    let response = { data: '', status: 0 };

    try {
      response = await api.Root.call();

      // expecting html back. parse it and send body to view
      const dom = load(response.data);
      const bodyHtml = dom('body').html();

      // send body to view bodyHtml.njk
      res.render('task/bodyHtml', { bodyHtml });
    } catch (error) {
      handleRouteError(res, response.data, error?.message);
    }
  });
}
