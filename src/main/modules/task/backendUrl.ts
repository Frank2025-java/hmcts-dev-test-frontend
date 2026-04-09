/**
 * The URL for the backend is a global state variable,
 * assuming there is only one frontend instance at the time.
 * That means if one user clicks “Use Local backend”,
 * everyone switches to the local backend,
 * and if another user clicks “Use AWS backend”,
 * everyone switches to the AWS backend.
 *
 * It is a demo app, so that should not be a problem.
 * For a real app, you would not give the frontend the option to switch backend at all,
 * because we would freeze the backend URL at build time, and have different builds 
 * for different environments (e.g. local, staging, production).
 * Alternatively, you would use a per-user selection stored in cookies or sessions.
 */
import { config } from '../variables';

let selectedBackend: string = '';

const availableBackends = [`${config.backendUrl}${config.basepath}`, `${config.backendAwsUrl}${config.basepath}`];

export function setBackend(url: string) : void {
  validateUrl(url);
  selectedBackend = url;
}

export function getBackend(): string {
  validateUrl(selectedBackend);
  return selectedBackend;
}

/**
 * Validates if the provided URL is in the list of available backends.
 * Otherwise throw an error
 * @param url to check
 */
export function validateUrl(url: string): void {
  if (!availableBackends.includes(url)) {
    throw new Error(`Not recognized backend URL: ${url}. Valid options are: ${availableBackends.join(', ')}`);
  }
}
