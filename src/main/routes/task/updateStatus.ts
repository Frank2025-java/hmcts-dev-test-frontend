import { Application } from 'express';

import { TaskRestApiClient } from 'modules/task/backend';

import { warning } from './error';

export const routePath = '/task/updateStatus/:id/status';

export default function (app: Application, api: TaskRestApiClient): void {
  app.post(routePath, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const response = await api.UpdateStatus.call(id, status);

      if (response.status === 200) {
        // refresh task list page after updating a task
        return res.redirect('/task/list');
      } else {
        // Unexpected status → stay on page
        return res.render('task/list.njk', {
          warning: warning(200, response.status, response.data),
          form: req.body,
        });
      }
    } catch (error: unknown) {
      // Unexpected status → stay on page
      return res.render('task/list.njk', {
        warning: error,
        form: req.body,
      });
    }
  });
}
