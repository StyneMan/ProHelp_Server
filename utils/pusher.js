import Pusher from 'pusher-js';

Pusher.logToConsole = true;

export const pusher = new Pusher('1c215c902be56f87e08f', {
  cluster: 'mt1',
});

pusher.connect();