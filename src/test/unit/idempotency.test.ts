// eslint-disable-next-line import/no-unresolved
import '../../main/types/express';

import { attachIdempotencyKey } from '../../main/modules/task/idempotency';

import { Request, Response } from './routes.test.base';

const testUuid = 'test-uuid-123';

// Avoid jest loading ESM uuid modules, because this is a CommonJS build
jest.mock('uuid', () => ({
  v4: jest.fn(() => testUuid),
}));

describe('Test Suite for attachIdempotencyKey', () => {
  const mockNext = jest.fn();

  const idemPotencyMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  it.each(idemPotencyMethods)('sets req.idempotencyKey for %s requests', idemPotencyMethod => {
    // given
    const req = { method: idemPotencyMethod } as Request;
    const res = {} as Response;

    // when
    attachIdempotencyKey(req, res, mockNext);

    // then
    expect(req.idempotencyKey).toBe(testUuid);
    expect(mockNext).toHaveBeenCalled();
  });

  it('does not set idempotencyKey for GET requests', () => {
    // given
    const req = { method: 'GET' } as Request;
    const res = {} as Response;

    // when
    attachIdempotencyKey(req, res, mockNext);

    // then
    expect(req.idempotencyKey).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });
});
