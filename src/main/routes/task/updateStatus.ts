import { Application } from 'express';
import axios from 'axios';

import { config } from '../../modules/variables';

export const routePath = '/task/updateStatus/:id/status';

export default function (app: Application, http: typeof axios): void {
  app.post(routePath, async (req, res) => {
    let response = { data: '', status: 0, statusText: '', headers: {}, config: {} };
    let responseStatus = 0;

    const { id } = req.params;
    const { status } = req.body;

    try {
      const url = `${config.backendUrl}${config.basepath}/update/${id}/status/${status}`;

      console.log('Calling:' + url);
      response = await http.put(url, { id, status });
      console.log(response.data);
      responseStatus = response.status;
    } catch (error: any) {
      response = error.response?.data;
      responseStatus = Number(error.response?.status);
    }

    if (responseStatus === 200) {
      // refresh task list page after updating a task
      return res.redirect('/task/list');
    } else {
      // Unexpected status → stay on page
      return res.render('task/list.njk', {
        warning: `Expected 200. Unexpected status code ${responseStatus}. <br><small>Response: ${response}</small>`,
        form: req.body,
      });
    }
  });
}
