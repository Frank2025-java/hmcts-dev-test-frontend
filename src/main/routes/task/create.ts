import { Application, Request, Response } from 'express';

import type { TaskDto } from 'types/task.dto';

import { TaskRestApiClient } from 'modules/task/backend';
import { toDto } from 'modules/task/mapper';

import { renderRouteError, warning } from './error';

export const routePath = '/task/create';

export default function (app: Application, api: TaskRestApiClient): void {
  app.get(routePath, async (_req: Request, res: Response) => {
    try {
      res.render('task/create.njk');
    } catch (error: unknown) {
      renderRouteError(res, error);
    }
  });

  app.post(routePath, async (req: Request, res: Response) => {
    try {
      const task: TaskDto = toDto(req.body);

      const response = await api.Create.call(task, req.idempotencyKey);

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
    } catch (error: unknown) {
      // stay on page, keep form data
      return res.render('task/create.njk', {
        warning: error,
        form: req.body,
      });
    }
  });
}
