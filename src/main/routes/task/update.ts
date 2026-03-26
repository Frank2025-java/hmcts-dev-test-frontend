import { Application } from 'express';

import type { TaskDto } from 'types/task.dto';
import { toDto } from 'modules/task/mapper';
import { TaskRestApiClient } from 'modules/task/backend';
import { warning } from './error';

export const routePath = '/task/update';

export default function (app: Application, api: TaskRestApiClient): void {
  app.post(routePath, async (req, res) => {
    let response = { data: '', status: 0 };

    try {
      const task: TaskDto = await toDto(req.body);

      response = await api.Update.call(task);

      if (response.status === 200) {
        // go to the task list page after updating a task
        return res.redirect('/task/list');
      } else {
        // Unexpected status → stay on page, keep form data
        return res.render('task/view.njk', {
          warning: warning(200, response.status, response.data),
          form: req.body,
        });
      }
    } catch (error: any) {
      // Stay on page, keep form data
      return res.render('task/view.njk', {
        warning: error,
        form: req.body,
      });
    }
  });
}
