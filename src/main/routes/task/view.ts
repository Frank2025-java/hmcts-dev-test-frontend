import { Application } from 'express';
import axios from 'axios';

import { config } from '../../modules/variables';

export const routePath = '/task/view/:id';

export default function (app: Application, http: typeof axios): void {
  app.get(routePath, async (req, res) => {
    console.log('Render view task form.');

    let response = { data: '', status: 0, statusText: '', headers: {}, config: {} };

    try {
      const { id } = req.params;
      const url = `${config.backendUrl}${config.basepath}/get/${id}`;

      console.log('Calling:', url);
      response = await http.get(url);

      return res.render('task/view.njk', { task: response.data });
    } catch (error: any) {
      // stay on page and show error message
      return res.render('task/view.njk', {
        warning: error?.message,
        form: req.body,
      });
    }
  });
}
