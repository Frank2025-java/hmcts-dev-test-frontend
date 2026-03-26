import axios from 'axios';
import { Application } from 'express';
import { config } from '../modules/variables';

export const routePath = '/';

export default function (app: Application): void {
  const urlBackEnd = `${config.backendUrl}${config.basepath}/`;
  const urlDemo = `${config.demoUrl}/`;

  app.get(routePath, async (req, res) => {
    res.render('home', {
      urlBackEnd: urlBackEnd,
      urlDemo: urlDemo,
    });
  });
}
