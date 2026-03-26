import { toDto, toDtoArray, isoDateTimeRegex, localDateTimeOptionalSecondsRegex } from '../../main/modules/task/mapper';
import type { TaskDto } from '../../main/types/task.dto';

describe('toDto mapper', () => {
  const validBody = {
    id: 123,
    title: 'Test task',
    description: 'Something',
    due: '2025-01-01T10:00:00Z',
    status: 'Initial',
  };

  it('maps a full valid body to TaskDto', () => {
    // when
    const dto = toDto(validBody);

    // then
    expect(dto).toEqual<TaskDto>({
      id: '123',
      title: 'Test task',
      description: 'Something',
      due: '2025-01-01T10:00:00Z',
      status: 'Initial',
    });

    expect(dto.due).toBeDefined();
    expect(isoDateTimeRegex.test(dto.due as string)).toBe(true);
  });

  it('throws an error when required fields are missing', () => {
    // given
    const body = {
      // missing title
      due: '2025-01-01T10:00:00Z',
    };

    // when, then
    expect(() => toDto(body)).toThrow();
  });

  it('allows optional id to be undefined', () => {
    // given
    const body = {
      ...validBody,
      id: undefined,
    };

    // when
    const dto = toDto(body);

    // then
    expect(dto.id).toBeUndefined();
  });

  it('allows optional description to be null when missing', () => {
    // given
    const body = {
      ...validBody,
      description: undefined,
    };

    // when
    const dto = toDto(body);

    // then
    expect(dto.description).toBeNull();
  });

  it('allows optional status to be null when missing', () => {
    // given
    const body = {
      ...validBody,
      status: undefined,
    };

    // when
    const dto = toDto(body);

    // then
    expect(dto.status).toBeUndefined();
  });

  it('throws an error when due is missing', () => {
    // given
    const body = {
      title: 'Test',
      description: 'Something',
      status: 'Initial',
    };

    // when, then throws
    expect(() => toDto(body)).toThrow();
  });

  it('throws an error when due is some text string', () => {
    // given
    const body = {
      ...validBody,
      due: 'not-a-date',
    };

    // when, then throws
    expect(() => toDto(body)).toThrow();
  });

  it('should leave it to REST API to error when due is not a valid iso date-time but satisfies regex', () => {
    // given
    const body = {
      title: 'Test task',
      due: '2026-02-29T25:00:00Z',
    };

    // when
    const dto = toDto(body);

    //then
    expect(dto).toEqual<TaskDto>({
      id: undefined,
      title: 'Test task',
      description: null,
      status: undefined,
      due: '2026-02-29T25:00:00Z',
    });

    expect(dto.due).toBeDefined();
    expect(isoDateTimeRegex.test(dto.due as string)).toBe(true);
  });

  it('should map an array of tasks', () => {
    // given
    const response = [
      { title: 'Test task 2', due: '2025-02-29T25:00:00Z', newfield: 'newfield2' },
      { id: 1, title: 'Test task 1', description: '', due: '2026-02-01T10:00:00Z', status: 'Initial' },
    ];

    // when
    const dtos = toDtoArray(response);

    // then
    expect(dtos).toEqual<TaskDto[]>([
      {
        id: undefined,
        title: 'Test task 2',
        description: null,
        status: undefined,
        due: '2025-02-29T25:00:00Z',
      },
      {
        id: '1',
        title: 'Test task 1',
        description: '',
        status: 'Initial',
        due: '2026-02-01T10:00:00Z',
      },
    ]);
  });

  it('should throw error when array is wrapped', () => {
    // given
    const wrappedArrayResponse = {
      data: [{ title: 'Test task 2', due: '2025-02-29T25:00:00Z', newfield: 'newfield2' }],
    };

    // when, then error
    expect(() => toDtoArray(wrappedArrayResponse)).toThrow();
  });

  it('should throw error when just a single task', () => {
    // given
    const singleTaskResponse = { title: 'Test task 2', due: '2025-02-29T25:00:00Z', newfield: 'newfield2' };

    // when, then error
    expect(() => toDtoArray(singleTaskResponse)).toThrow();
  });

  it('should throw error when one element wrong', () => {
    // given
    const responseMissingSecondTitle = {
      data: [
        { title: 'Test task 2', due: '2025-02-29T25:00:00Z', newfield: 'newfield2' },
        { id: 1, description: '', due: '2026-02-01T10:00:00Z', status: 'Initial' },
      ],
    };
    // when, then error
    expect(() => toDtoArray(responseMissingSecondTitle)).toThrow();
  });
});

// ISO date-time validation, not strict but recommended level by CoPilot
// Adjusted to pass without a timezone,
// because I made a mistake of LocalDateTime in the java TaskDto instead of a ZonedDateTime
describe('DateTime validation', () => {
  // regular valid datetime, non-existing date, no timezone, no seconds

  const givenIsoPass: string[] = ['2026-02-01T10:00:00Z', '2025-02-29T25:00:00Z'];
  const givenIsoFail: string[] = ['2026-02-01', '25:00:00', '', '     ', '2026-03-12T22:51:00', '2026-03-25T02:40'];

  const givenLocalPass: string[] = ['2026-03-12T22:51:00', '2026-03-25T02:40'];
  const givenLocalFail: string[] = [
    '2026-02-01T10:00:00Z',
    '2025-02-29T25:00:00Z',
    '2026-02-01',
    '25:00:00',
    '',
    '     ',
  ];

  test.each(givenIsoPass)('Datetime %p should pass isoDateTime', datetimeString => {
    expect(isoDateTimeRegex.test(datetimeString)).toBe(true);
  });

  test.each(givenIsoFail)('Datetime %p should fail isoDateTime', datetimeString => {
    expect(isoDateTimeRegex.test(datetimeString)).toBe(false);
  });

  test.each(givenLocalPass)('Datetime %p should pass local datetime', datetimeString => {
    expect(localDateTimeOptionalSecondsRegex.test(datetimeString)).toBe(true);
  });

  test.each(givenLocalFail)('Datetime %p should fail local datetime', datetimeString => {
    expect(localDateTimeOptionalSecondsRegex.test(datetimeString)).toBe(false);
  });

  test.each(givenIsoPass)('IsoDatetime %p should have timezone and thus not pass local datetime', datetimeString => {
    expect(localDateTimeOptionalSecondsRegex.test(datetimeString)).toBe(false);
  });

  test.each(givenLocalPass)('local datetime %p should convert to isodatetime (UTC)', datetimeString => {
    const utc = new Date(datetimeString).toISOString();
    expect(isoDateTimeRegex.test(utc)).toBe(true);
  });
});
