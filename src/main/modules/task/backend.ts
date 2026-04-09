import axios, { isAxiosError } from 'axios';

import type { TaskDto } from 'types/task.dto';

import { getBackend } from './backendUrl';

export interface AxiosClient {
  http: typeof axios;
}

export interface TaskRestApiResponse<T> {
  data: T | string; // the type is T on the success status, otherwise string
  status: number; // the success status value is defined on the REST api
}

// return the {Root, Create,....} as a type, to allow api:TaskRestApiClient declaration
export interface TaskRestApiClient {
  Root: { call: () => Promise<TaskRestApiResponse<string>> };
  Create: { call: (dto: TaskDto) => Promise<TaskRestApiResponse<TaskDto>> };
  List: { call: () => Promise<TaskRestApiResponse<TaskDto[]>> };
  View: { call: (id: string) => Promise<TaskRestApiResponse<TaskDto>> };
  Update: { call: (dto: TaskDto) => Promise<TaskRestApiResponse<TaskDto>> };
  UpdateStatus: { call: (id: string, status: string) => Promise<TaskRestApiResponse<TaskDto>> };
  Delete: { call: (id: string) => Promise<TaskRestApiResponse<void>> };
}

/* eslint-disable no-console */
export function TaskRestApi({ http }: AxiosClient): TaskRestApiClient {
  const call = async <TRes = unknown>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    dto?: TaskDto
  ): Promise<TaskRestApiResponse<TRes>> => {
    const url = `${getBackend()}${path}`;

    console.log('Calling:', url);

    let response = { data: '', status: 0, statusText: '', headers: {}, config: {} };

    try {
      switch (method) {
        case 'GET':
          response = await http.get(url);
          break;

        case 'POST': {
          response = await http.post(url, dto);
          break;
        }

        case 'PUT':
          response = await http.put(url);
          break;

        case 'DELETE':
          response = await http.delete(url);
          break;

        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      console.log(response.data);

      return {
        data: response.data as TRes,
        status: Number(response.status),
      };
    } catch (error: unknown) {
      console.error('API call error:', error);

      if (isAxiosError<string>(error)) {
        if (error.response) {
          // Backend responded with an error
          return {
            data: error.response.data,
            status: Number(error.response.status),
          };
        } else {
          // Network-level failure
          return {
            data: error.message,
            status: 0,
          };
        }
      } else {
        return {
          data: String(error),
          status: 0,
        };
      }
    }
  };

  return {
    Root: {
      call: () => call('/', 'GET'),
    },
    Create: {
      call: (dto: TaskDto) => call('/create', 'POST', dto),
    },
    List: {
      call: () => call('/get-all-tasks', 'GET'),
    },
    View: {
      call: (id: string) => call(`/get/${id}`, 'GET'),
    },
    Update: {
      call: (dto: TaskDto) => call('/update', 'POST', dto),
    },
    UpdateStatus: {
      call: (id: string, status: string) => call(`/update/${id}/status/${status}`, 'PUT'),
    },
    Delete: {
      call: (id: string) => call(`/delete/${id}`, 'DELETE'),
    },
  };
}
