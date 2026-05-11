export const socketClient = {
  connect: () => {
    console.log("Connecting to live websocket...");
  },
  sendMessage: (message: string) => {
    console.log("Sending live chat message:", message);
  },
};
