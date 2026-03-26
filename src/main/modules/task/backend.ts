import axios from 'axios';
import { config } from '../variables';
import type { TaskDto } from 'types/task.dto';

export interface AxiosClient {
  http: typeof axios;
}

export interface TaskRestApiResponse<T> {
  data: T;
  status: number;
}

export function TaskRestApi({ http }: AxiosClient) {
  const call = async <TReq = any, TRes = any>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    dto?: TaskDto
  ): Promise<TaskRestApiResponse<TRes>> => {
    const url = `${config.backendUrl}${config.basepath}${path}`;

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
    } catch (error: any) {
      console.error('API call error:', error);

      const errResponse = error?.response;

      return {
        data: (errResponse?.data as TRes) ?? error.message,
        status: Number(errResponse?.status ?? 0),
      };
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

// return the {Root, Create,....} as a type, to allow api:TaskRestApiClient declaration
export type TaskRestApiClient = ReturnType<typeof TaskRestApi>;
