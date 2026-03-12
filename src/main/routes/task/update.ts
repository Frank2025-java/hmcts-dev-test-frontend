import { Application } from 'express';
import axios from 'axios';

import { config } from '../../modules/variables';
import { handleRouteError } from './error';
import type { TaskDto } from '../../types/task.dto';

export const routePath = '/task/update';

export default function (app: Application, http: typeof axios): void {
  app.post(routePath, async (req, res) => {
    let response = { data: '', status: 0, statusText: '', headers: {}, config: {} };
    let status = 0;

    const dto: TaskDto = {
      id: req.body.id,
      title: req.body.title,
      description: req.body.description,
      due: req.body.due,
      status: req.body.status,
    };

    try {
      const url = `${config.backendUrl}${config.basepath}/update`;

      console.log('Calling:' + url);
      response = await http.post(url, dto);
      console.log(response.data);
      status = response.status;
    } catch (error: any) {
      status = Number(error.response?.status);
      response = error.response;
    }

    try {
      if (status === 200) {
        // go to the task list page after updating a task
        return res.redirect('/task/list');
      } else {
        // Unexpected status → stay on page, keep form data
        return res.render('task/view.njk', {
          warning: `Expected 200. Unexpected status code ${status}. <br><small>Response: ${response.data}</small>`,
          form: req.body,
        });
      }
    } catch (error: any) {
      handleRouteError(res, response, error);
    }
  });
}
