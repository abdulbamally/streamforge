import { FastifyPluginAsync } from "fastify";

const sockets = new Set<any>();

export const socketRoute: FastifyPluginAsync = async (app) => {
  app.get("/", { websocket: true }, (connection, req) => {
    sockets.add(connection.socket);

    connection.socket.on("message", (message) => {
      try {
        const payload =
          typeof message === "string" ? message : message.toString();
        const event = JSON.parse(payload);

        if (event?.type === "chat:send") {
          const outgoing = JSON.stringify({
            type: "chat:receive",
            payload: event.payload,
          });
          sockets.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(outgoing);
            }
          });
        }
      } catch (error) {
        connection.socket.send(
          JSON.stringify({ type: "error", message: "Invalid socket payload" }),
        );
      }
    });

    connection.socket.on("close", () => {
      sockets.delete(connection.socket);
    });
  });
};
