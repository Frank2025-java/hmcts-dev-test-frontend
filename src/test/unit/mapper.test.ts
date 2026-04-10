import {
  TaskFormInput,
  fromBackendDto,
  fromBackendDtoArray,
  isoDateTimeRegex,
  localDateTimeOptionalSecondsRegex,
  toDto,
} from '../../main/modules/task/mapper';
import type { TaskDto } from '../../main/types/task.dto';

describe('toDto mapper', () => {
  const validBody: TaskFormInput = {
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
    const body: TaskFormInput = {
      // missing title
      due: '2025-01-01T10:00:00Z',
    };

    // when, then
    expect(() => toDto(body)).toThrow();
  });

  it('allows optional id to be undefined', () => {
    // given
    const body: TaskFormInput = {
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
    const body: TaskFormInput = {
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
    const body: TaskFormInput = {
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
    const body: TaskFormInput = {
      title: 'Test',
      description: 'Something',
      status: 'Initial',
    };

    // when, then throws
    expect(() => toDto(body)).toThrow();
  });

  it('throws an error when due is some text string', () => {
    // given
    const body: TaskFormInput = {
      ...validBody,
      due: 'not-a-date',
    };

    // when, then throws
    expect(() => toDto(body)).toThrow();
  });
});

describe('fromBackendDto mapper', () => {
  const validResponse: TaskDto = {
    id: '123',
    title: 'Test task',
    description: 'Something',
    due: '2025-01-01T10:00:00Z',
    status: 'Initial',
  };

  it('maps a full valid dto response to TaskDto', () => {
    // when
    const dto = fromBackendDto(validResponse);

    // then
    expect(dto).toEqual<TaskDto>({
      id: '123',
      title: 'Test task',
      description: 'Something',
      due: '2025-01-01T10:00:00Z',
      status: 'Initial',
    });
  });

  it('Should have  id on response', () => {
    // given
    const backendResponse: TaskDto = {
      ...validResponse,
      id: undefined,
    };

    // when, then
    expect(() => fromBackendDto(backendResponse)).toThrow();
  });

  it('Should have status on response', () => {
    // given
    const backendResponse: TaskDto = {
      ...validResponse,
      status: undefined,
    };

    // when, then
    expect(() => fromBackendDto(backendResponse)).toThrow();
  });

  it('Should have due on response', () => {
    // given
    const backendResponse: TaskDto = {
      ...validResponse,
      due: undefined,
    };

    // when, then
    expect(() => fromBackendDto(backendResponse)).toThrow();
  });

  it('Should have valid due date', () => {
    // given
    const response = {
      ...validResponse,
      due: 'not-a-date',
    };

    // when, then throws
    expect(() => fromBackendDto(response)).toThrow();
  });
});

describe('Verify backend get all DTO mapping', () => {
  it('should map an array of tasks', () => {
    // given
    const response = [
      {
        id: 2,
        title: 'Test task 2',
        description: null,
        due: '2025-02-29T23:00:00-02:00',
        newfield: 'newfield2',
        status: 'Deleted',
      },
      { id: 1, title: 'Test task 1', description: '', due: '2026-02-01T10:00:00Z', status: 'Initial' },
    ];

    // when
    const dtos = fromBackendDtoArray(response);

    // then
    expect(dtos).toEqual<TaskDto[]>([
      {
        id: '2',
        title: 'Test task 2',
        description: null,
        status: 'Deleted',
        due: '2025-02-29T23:00:00-02:00',
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
    expect(() => fromBackendDtoArray(wrappedArrayResponse)).toThrow();
  });

  it('should throw error when just a single task', () => {
    // given
    const singleTaskResponse = { title: 'Test task 2', due: '2025-02-29T25:00:00Z', newfield: 'newfield2' };

    // when, then error
    expect(() => fromBackendDtoArray(singleTaskResponse)).toThrow();
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
    expect(() => fromBackendDtoArray(responseMissingSecondTitle)).toThrow();
  });
});

// ISO date-time validation, not strict but recommended level by CoPilot
// Adjusted to pass without a timezone,
// because I made a mistake of LocalDateTime in the java TaskDto instead of a ZonedDateTime
describe('DateTime validation', () => {
  // regular valid datetime, non-existing date, no timezone, no seconds

  const givenIsoPass: string[] = [
    '2026-03-10T23:59:00+00:00',
    '2024-03-10T12:30:45.250-05:30',
    '2024-02-29T23:59:59+02:00',
    '2019-02-29T23:59:59+01:00',
  ];
  const givenIsoFail: string[] = ['2026-03-10T23:59:00'];

  const givenUtcPass: string[] = ['2026-02-01T10:00:00Z', '2025-02-29T25:00:00Z'];
  const givenUtcFail: string[] = ['2026-02-01', '25:00:00', '', '     ', '2026-03-12T22:51:00', '2026-03-25T02:40'];

  const givenLocalPass: string[] = ['2026-03-12T22:51:00', '2026-03-25T02:40'];
  const givenLocalFail: string[] = [
    '2026-02-01T10:00:00Z',
    '2025-02-29T25:00:00Z',
    '2026-02-01',
    '25:00:00',
    '',
    '     ',
  ];

  test.each(givenIsoPass)('Datetime %p should pass iso DateTime', datetimeString => {
    expect(isoDateTimeRegex.test(datetimeString)).toBe(true);
  });

  test.each(givenIsoFail)('Datetime %p should fail iso DateTime', datetimeString => {
    expect(isoDateTimeRegex.test(datetimeString)).toBe(false);
  });

  test.each(givenUtcFail)('Datetime %p should fail utc DateTime', datetimeString => {
    expect(isoDateTimeRegex.test(datetimeString)).toBe(false);
  });

  test.each(givenLocalPass)('Datetime %p should pass local datetime', datetimeString => {
    expect(localDateTimeOptionalSecondsRegex.test(datetimeString)).toBe(true);
  });

  test.each(givenLocalFail)('Datetime %p should fail local datetime', datetimeString => {
    expect(localDateTimeOptionalSecondsRegex.test(datetimeString)).toBe(false);
  });

  test.each(givenUtcPass)('IsoDatetime %p should have timezone and thus not pass local datetime', datetimeString => {
    expect(localDateTimeOptionalSecondsRegex.test(datetimeString)).toBe(false);
  });
});
