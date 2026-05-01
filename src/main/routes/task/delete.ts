import { Application, Request, Response } from 'express';

import { TaskRestApiClient } from 'modules/task/backend';

import { warning } from './error';

export const routePath = '/task/delete/:id';

export default function (app: Application, api: TaskRestApiClient): void {
  app.post(routePath, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const response = await api.Delete.call(id, req.idempotencyKey);

      if (response.status === 204) {
        // refresh the task list page after deleting a task
        return res.redirect('/task/list');
      } else {
        // Unexpected status → stay on page, keep form data
        return res.render('task/list.njk', {
          warning: warning(204, response.status, response.data),
          form: req.body,
        });
      }
    } catch (error) {
      return res.render('task/list.njk', { warning: error });
    }
  });
}
