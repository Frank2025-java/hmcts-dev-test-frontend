import axios from 'axios';
import { Application } from 'express';

export default function (app: Application, http = axios): void {
  app.get('/', async (req, res) => {
    try {
      // An example of connecting to the backend (a starting point)
      const response = await http.get('http://localhost:4000/get-example-case');
      // eslint-disable-next-line no-console
      console.log(response.data);
      res.render('home', { example: response.data });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error making request:', error);
      res.render('home', {});
    }
  });
}
