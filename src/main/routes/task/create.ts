import { Application } from 'express';
import axios from 'axios';

import { config } from '../../modules/variables';
import { handleRouteError } from './error';

export const routePath = '/task/create';

export default function (app: Application, http: typeof axios): void {
  app.get(routePath, async (req, res) => {
    try {
      res.render('task/create.njk');
    } catch (error: any) {
      handleRouteError(res, {}, error);
    }
  });

  app.post(routePath, async (req, res) => {
    let response = { data: '', status: 0, statusText: '', headers: {}, config: {} };

    try {
      const url = `${config.backendUrl}${config.basepath}/create`;

      console.log('Calling:' + url);
      response = await http.post(url, req.body);
      console.log(response.data);
    } catch (error: any) {
      // if server tells bad request, show the error message and keep form data
      if (error.response?.status === 400) {
        response = error.response; // Get the response from the error object
      } else {
        handleRouteError(res, response, error);
        return; // Stop further execution after handling the error
      }
    }

    if (response.status === 201) {
      // go to the task list page after creating a task
      return res.redirect('/task/list');
    } else {
      // Unexpected status → stay on page, keep form data
      return res.render('task/create.njk', {
        warning: `Unexpected status code ${response.status}. Expected 201. <br><small>Response: ${response.data}</small>`,
        form: req.body,
      });
    }
  });
}
