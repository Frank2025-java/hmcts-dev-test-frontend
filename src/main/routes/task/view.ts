import { Application } from 'express';

import { TaskDto } from 'types/task.dto';

import { TaskRestApiClient } from 'modules/task/backend';
import { fromBackendDto } from 'modules/task/mapper';

import { warning } from './error';

export const routePath = '/task/view/:id';

export default function (app: Application, api: TaskRestApiClient): void {
  app.get(routePath, async (req, res) => {
    try {
      const { id } = req.params;

      const response = await api.View.call(id);

      if (response.status === 200) {
        const dto: TaskDto = fromBackendDto(response.data);

        return res.render('task/view.njk', { task: dto });
      } else {
        // stay on page and show error message
        return res.render('task/view.njk', {
          warning: warning(200, response.status, response.data),
          form: req.body,
        });
      }
    } catch (error: unknown) {
      // stay on page and show error message
      return res.render('task/view.njk', {
        warning: error,
        form: req.body,
      });
    }
  });
}
