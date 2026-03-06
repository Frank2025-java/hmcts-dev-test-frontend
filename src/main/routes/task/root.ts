import { Application } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

import { config } from '../../modules/variables';

export const routePath = '/task';

// /task root route (expecting to send back welcome html)
export default function (app: Application, http: typeof axios): void {
  app.get(routePath, async (req, res) => {
    try {
      const url = `${config.backendUrl}${config.basepath}/`;

      console.log('Calling:' + url);
      const response = await http.get(url);
      console.log(response.data);

      // expecting html back. parse it and send body to view
      const dom = cheerio.load(response.data);
      const bodyHtml = dom('body').html();

      // send body to view bodyHtml.njk
      res.render('task/bodyHtml', { bodyHtml });
    } catch (error) {
      console.error('Error making request:', error);
      res.render('task/bodyHtml', { error: error.message || 'Error while fetching data.' });
    }
  });
}
