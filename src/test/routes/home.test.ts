import request from 'supertest';
import express from 'express';

import testSubject from '../../main/routes/home';
import { routePath } from '../../main/routes/home';

const expectedTemplate = 'home';

/* eslint-disable jest/expect-expect */
describe('Route Home Module', () => {
  describe('on GET', () => {
    test('should render home page', async () => {
      const testApp = express();
      const renderMock = jest.fn(function (view, locals) {
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
