import { Status, toStatus } from '../../main/types/status';

describe('toStatus', () => {
  it('throws when value is undefined', () => {
    expect(() => toStatus(undefined)).toThrow('Status must be a string');
  });

  it('throws when value is a number', () => {
    expect(() => toStatus(123)).toThrow('Status must be a string');
  });

  it('throws when value is a string not in the enum', () => {
    expect(() => toStatus('NotAStatus')).toThrow('Invalid status "NotAStatus"');
  });

  it('returns correct Status for all valid enum values', () => {
    for (const s of Object.values(Status)) {
      expect(toStatus(s)).toBe(s);
    }
  });
});
