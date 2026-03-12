import { Application } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

import { config } from '../../modules/variables';
import { handleRouteError } from './error';

export const routePath = '/task';

// /task root route (expecting to send back welcome html)
export default function (app: Application, http: typeof axios): void {
  let response = { data: '', status: 0, statusText: '', headers: {}, config: {} };

  app.get(routePath, async (req, res) => {
    try {
      const url = `${config.backendUrl}${config.basepath}/`;

      console.log('Calling:' + url);
      response = await http.get(url);
      console.log(response.data);

      // expecting html back. parse it and send body to view
      const dom = cheerio.load(response.data);
      const bodyHtml = dom('body').html();

      // send body to view bodyHtml.njk
      res.render('task/bodyHtml', { bodyHtml });
    } catch (error) {
      handleRouteError(res, response, error);
    }
  });
}
