import { expect } from 'chai';
import request from 'supertest';
import mockAxios from 'axios';
import express from 'express';

import { setupApp } from '../../main/app.setup';


jest.mock('axios');

/* eslint-disable jest/expect-expect */
describe('Home page', () => {
  describe('on GET', () => {
    test('should return sample home page', async () => {

      // Create an Express app
      const testApp = express();

      // stub response.render to avoid actual rendering and just send a simple response
      testApp.response.render = function () {
        this.send('<html>OK</html>');
      };

      // Set up the app with the route using the mocked axios
      setupApp(testApp, mockAxios);

      // Mock axios.get return value
      (mockAxios.get as jest.Mock).mockResolvedValue({ data: { ok: true } });

      await request(testApp)
        .get('/')
        .expect(res => expect(res.status).to.equal(200));
    });
  });
});
