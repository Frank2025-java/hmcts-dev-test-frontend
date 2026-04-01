import { Application } from 'express';

import type { TaskDto } from 'types/task.dto';

import { TaskRestApiClient } from 'modules/task/backend';
import { toDto } from 'modules/task/mapper';

import { warning } from './error';

export const routePath = '/task/update';

export default function (app: Application, api: TaskRestApiClient): void {
  app.post(routePath, async (req, res) => {
    try {
      const task: TaskDto = toDto(req.body);

      const response = await api.Update.call(task);

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
    } catch (error: unknown) {
      // Stay on page, keep form data
      return res.render('task/view.njk', {
        warning: error,
        form: req.body,
      });
    }
  });
}
