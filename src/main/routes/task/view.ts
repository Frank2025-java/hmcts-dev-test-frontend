import { Application } from 'express';

import { TaskRestApiClient } from 'modules/task/backend';
import { warning } from './error';
import { TaskDto } from 'types/task.dto';
import { toDto } from 'modules/task/mapper';

export const routePath = '/task/view/:id';

export default function (app: Application, api: TaskRestApiClient): void {
  app.get(routePath, async (req, res) => {
    let response = { data: '', status: 0 };

    try {
      const { id } = req.params;

      response = await api.View.call(id);

      if (response.status === 200) {
        const dto: TaskDto = toDto(response.data);

        return res.render('task/view.njk', { task: dto });
      } else {
        // stay on page and show error message
        return res.render('task/view.njk', {
          warning: warning(200, response.status, response.data),
          form: req.body,
        });
      }
    } catch (error: any) {
      // stay on page and show error message
      return res.render('task/view.njk', {
        warning: error,
        form: req.body,
      });
    }
  });
}
