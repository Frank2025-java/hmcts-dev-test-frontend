import { Application } from 'express';

import { config } from '../modules/variables';

export const routePath = '/';

export default function (app: Application): void {
  const urlBackEndAws = `${config.backendAwsUrl}${config.basepath}`;
  const urlBackEnd = `${config.backendUrl}${config.basepath}`;
  const urlDemo = `${config.demoUrl}`;

  app.get(routePath, async (req, res) => {
    res.render('home', {
      urlBackEndAws,
      urlBackEnd,
      urlDemo,
    });
  });
}
