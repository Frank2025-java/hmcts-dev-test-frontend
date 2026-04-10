import { Application } from 'express';

import { setBackend } from '../modules/task/backendUrl';

export const routePath = '/select-task-backend';

export default function (app: Application): void {
  app.post('/select-task-backend', async (req, res) => {
    try {
      setBackend(req.body.backend);
      return res.redirect('/task/list');
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ error: message });
    }
  });
}
