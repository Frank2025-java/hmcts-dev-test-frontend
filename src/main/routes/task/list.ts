import { Application } from 'express';

import { Status } from 'types/status';
import { TaskDto } from 'types/task.dto';

import { TaskRestApiClient } from 'modules/task/backend';
import { fromBackendDtoArray } from 'modules/task/mapper';

import { warning } from './error';

export const routePath = '/task/list';

export default function (app: Application, api: TaskRestApiClient): void {
  app.get(routePath, async (req, res) => {
    let tasks: TaskDto[] = [];

    try {
      const response = await api.List.call();

      if (response.status === 200) {
        tasks = fromBackendDtoArray(response.data);
      } else {
        if (response.status === 400 && typeof response.data === 'string' && response.data.includes('none')) {
          tasks = [];
        } else {
          return res.render('task/list.njk', { warning: warning(200, response.status, response.data) });
        }
      }

      if (tasks.length > 0) {
        tasks.sort((a: TaskDto, b: TaskDto) => Number(a.id) - Number(b.id));
      }
      return res.render('task/list', { tasks, statusOptions: Object.values(Status) });
    } catch (error: unknown) {
      return res.render('task/list.njk', { warning: error });
    }
  });
}
