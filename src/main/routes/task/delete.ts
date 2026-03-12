import { Application } from 'express';
import axios from 'axios';

import { config } from '../../modules/variables';

export const routePath = '/task/delete/:id';

export default function (app: Application, http: typeof axios): void {
  app.post(routePath, async (req, res) => {
    let response = { data: '', status: 0, statusText: '', headers: {}, config: {} };
    let status = 0;

    const { id } = req.params;

    try {
      const url = `${config.backendUrl}${config.basepath}/delete/${id}`;

      console.log('Calling:' + url);
      response = await http.delete(url);
      console.log(response.data);
      status = response.status;
    } catch (error: any) {
      status = Number(error.response?.status);
      response = error.response;
    }

    if (status === 204) {
      // refresh the task list page after deleting a task
      return res.redirect('/task/list');
    } else {
      // Unexpected status → stay on page, keep form data
      return res.render('task/list.njk', {
        warning: `Expected 204. Unexpected status code ${status}. <br><small>Response: ${response.data}</small>`,
        form: req.body,
      });
    }
  });
}
