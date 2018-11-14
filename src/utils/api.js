import uuid from 'node-uuid';
import { ipcRenderer } from 'electron';

export function sendRequest({ action, data }) {
  const id = uuid.v4();
  const request = { id, action, data };

  return new Promise((resolve) => {
    ipcRenderer.once('api-response-' + id, (event, data) => {
      resolve(data);
    });
    ipcRenderer.send('api-request', request);
  });
}

