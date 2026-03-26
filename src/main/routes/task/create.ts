import { Application } from 'express';

import type { TaskDto } from 'types/task.dto';
import { toDto } from 'modules/task/mapper';
import { TaskRestApiClient } from 'modules/task/backend';
import { handleRouteError, warning } from './error';

export const routePath = '/task/create';

export default function (app: Application, api: TaskRestApiClient): void {
  app.get(routePath, async (req, res) => {
    try {
      res.render('task/create.njk');
    } catch (error: any) {
      handleRouteError(res, {}, error?.message);
    }
  });

  app.post(routePath, async (req, res) => {
    let response = { data: '', status: 0 };

    try {
      const task: TaskDto = toDto(req.body);

      response = await api.Create.call(task);

      if (response.status === 201) {
        // go to the task list page after creating a task
        return res.redirect('/task/list');
      } else {
        // Unexpected status → stay on page, keep form data
        return res.render('task/create.njk', {
          warning: warning(201, response.status, response.data),
          form: req.body,
        });
      }
    } catch (error: any) {
      // stay on page, keep form data
      return res.render('task/create.njk', {
        warning: error,
        form: req.body,
      });
    }
  });
}
