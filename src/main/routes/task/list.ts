import { Application } from 'express';
import axios from 'axios';
import { handleRouteError } from './error';

import { config } from '../../modules/variables';
import { TaskDto } from '../../types/task.dto';
import { Status } from '../../types/status';

export const routePath = '/task/list';

export default function (app: Application, http: typeof axios): void {
  app.get(routePath, async (req, res) => {
    let response = { data: '', status: 0, statusText: '', headers: {}, config: {} };
    let tasks: TaskDto[] = [];

    try {
      const url = `${config.backendUrl}${config.basepath}/get-all-tasks`;
      console.log('Calling:' + url);
      response = await http.get(url);
      console.log(response.data);

      tasks = Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      const status = Number(error.response?.status);
      const message = error.response?.data;

      if (status === 400 && typeof message === 'string' && message.includes('none')) {
        console.log('Backend reports no tasks — rendering empty list: ' + message);
      } else {
        handleRouteError(res, response, error);
        return; // Stop further execution after handling the error
      }
    }

    if (tasks.length > 0) {
      tasks.sort((a: any, b: any) => Number(a.id) - Number(b.id));
    }
    return res.render('task/list', { tasks: tasks, statusOptions: Object.values(Status) });
  });
}
