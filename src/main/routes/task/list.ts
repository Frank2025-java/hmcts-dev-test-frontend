import { Application } from 'express';

import { TaskDto } from 'types/task.dto';
import { Status } from 'types/status';

import { TaskRestApiClient } from 'modules/task/backend';
import { warning } from './error';
import { toDtoArray } from 'modules/task/mapper';

export const routePath = '/task/list';

export default function (app: Application, api: TaskRestApiClient): void {
  app.get(routePath, async (req, res) => {
    let tasks: TaskDto[] = [];

    try {
      const response = await api.List.call();

      if (response.status === 200) {
        tasks = toDtoArray(response.data);
      } else {
        if (response.status === 400 && typeof response.data === 'string' && response.data.includes('none')) {
          console.log('Backend reports no tasks — rendering empty list: ' + response.data);
          tasks = [];
        } else {
          return res.render('task/list.njk', { warning: warning(200, response.status, response.data) });
        }
      }

      if (tasks.length > 0) {
        tasks.sort((a: any, b: any) => Number(a.id) - Number(b.id));
      }
      return res.render('task/list', { tasks: tasks, statusOptions: Object.values(Status) });
    } catch (error) {
      return res.render('task/list.njk', { warning: error });
    }
  });
}
