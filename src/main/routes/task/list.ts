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

      sortForDisplay(tasks);

      return res.render('task/list', { tasks, statusOptions: Object.values(Status) });
    } catch (error: unknown) {
      return res.render('task/list.njk', { warning: error });
    }
  });
}

export function sortForDisplay(tasks: TaskDto[]): void {
  // for display, we want the tasks to be converted from some iso timezone format to local time,
  // and display them in a predicatable order for the user.
  if (tasks.length > 0) {
    // normalize the due timestamp, so it can be displayed in local timezone
    tasks.forEach((task: TaskDto) => {
      if (!task.due) {
        task.due = undefined;
        return;
      }

      const timestamp = Date.parse(task.due);
      if (isNaN(timestamp)) {
        task.due = undefined;
        return;
      }

      task.due = new Date(timestamp).toISOString();
    });

    // sort the tasks by due date if any task has a non-numeric id, otherwise sort by id
    const hasNoNumericId: boolean = tasks.some((task: TaskDto) => isNaN(Number(task.id)));

    if (hasNoNumericId) {
      tasks.sort((a: TaskDto, b: TaskDto) => {
        if (!a.due) {
          return 1;
        }
        if (!b.due) {
          return -1;
        }
        return a.due.localeCompare(b.due);
      });
    } else {
      tasks.sort((a: TaskDto, b: TaskDto) => Number(a.id) - Number(b.id));
    }
  }
}
