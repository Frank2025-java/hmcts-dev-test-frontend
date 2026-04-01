import express from 'express';
import request from 'supertest';

import testSubject, { routePath } from '../../main/routes/home';

const expectedTemplate = 'home';

/* eslint-disable jest/expect-expect */
describe('Route Home Module', () => {
  describe('on GET', () => {
    test('should render home page', async () => {
      const testApp = express();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const renderMock = jest.fn(function (_view, _locals) {
        this.send('OK');
      });
      testApp.response.render = renderMock;

      // Set up the app with the route
      testSubject(testApp);

      const res = await request(testApp).get(routePath);

      expect(res.status).toBe(200);
      expect(renderMock).toHaveBeenCalledWith(expectedTemplate, expect.anything());
    });
  });
});
