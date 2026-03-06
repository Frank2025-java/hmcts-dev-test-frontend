import axios from 'axios';
import { Application } from 'express';

import { config } from '../modules/variables';

export default function (app: Application, http = axios): void {
  app.get('/demo', async (req, res) => {
    try {
      // An example of connecting to the backend (a starting point)
      const response = await http.get(`${config.demoUrl}/get-example-case`);
      // eslint-disable-next-line no-console
      console.log(response.data);
      res.render('demo', { example: response.data });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error making request:', error);
      res.render('demo', {});
    }
  });
}
