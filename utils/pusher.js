import Pusher from "pusher"

export const pusher = new Pusher({
  appId: '1782638',
  key: '1c215c902be56f87e08f',
  secret: 'ff248e804ca4bd09a001',
  cluster: 'mt1',
  useTLS: true
});

