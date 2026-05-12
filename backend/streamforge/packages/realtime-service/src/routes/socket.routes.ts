import type { FastifyPluginAsync } from "fastify";
import type { AccessTokenUser } from "../types/access-token-user";
import { WebSocket } from "ws";
import { prisma } from "../utils/prisma";
import {
  addToRoom,
  broadcastLocal,
  removeFromAllRooms,
  removeFromRoom,
} from "../ws/room-registry";
import { allowChatMessage } from "../ws/rate-limit";
import { getRedisBus } from "../redis/bus";

type ClientState = {
  user: AccessTokenUser;
  streamId: string | null;
};

const clientMeta = new WeakMap<WebSocket, ClientState>();

export const socketRoute: FastifyPluginAsync = async (app) => {
  app.get(
    "/stream",
    {
      websocket: true,
      schema: {
        querystring: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
        },
      },
    },
    (connection, req) => {
      const socket = connection.socket as WebSocket;
      const token =
        (req.query as { token?: string }).token ??
        new URL(req.url, "http://localhost").searchParams.get("token") ??
        "";

      if (!token) {
        socket.close(4401, "token required");
        return;
      }

      let user: AccessTokenUser;
      try {
        user = app.jwt.verify<AccessTokenUser>(token);
      } catch {
        socket.close(4401, "invalid token");
        return;
      }

      clientMeta.set(socket, { user, streamId: null });

      socket.on("message", async (raw) => {
        const state = clientMeta.get(socket);
        if (!state) return;

        let msg: { type?: string; streamId?: string; text?: string; reaction?: string };
        try {
          const rawStr = typeof raw === "string" ? raw : raw.toString();
          msg = JSON.parse(rawStr) as typeof msg;
        } catch {
          socket.send(
            JSON.stringify({
              type: "error",
              code: "VAL_001",
              message: "Invalid JSON",
            }),
          );
          return;
        }

        if (msg.type === "stream:join" && msg.streamId) {
          if (state.streamId) {
            removeFromRoom(state.streamId, socket);
          }
          state.streamId = msg.streamId;
          addToRoom(msg.streamId, socket);
          socket.send(
            JSON.stringify({
              type: "stream:joined",
              streamId: msg.streamId,
            }),
          );
          return;
        }

        if (msg.type === "stream:leave") {
          if (state.streamId) {
            removeFromRoom(state.streamId, socket);
            state.streamId = null;
          }
          socket.send(JSON.stringify({ type: "stream:left" }));
          return;
        }

        if (msg.type === "chat:send") {
          const streamId = msg.streamId ?? state.streamId;
          const chatText = (msg.text ?? "").trim();
          if (!streamId || !chatText.length) {
            socket.send(
              JSON.stringify({
                type: "error",
                code: "VAL_001",
                message: "streamId and text are required",
              }),
            );
            return;
          }
          if (chatText.length > 2000) {
            socket.send(
              JSON.stringify({
                type: "error",
                code: "VAL_001",
                message: "message too long",
              }),
            );
            return;
          }

          const rateKey = `${state.user.sub}:${streamId}`;
          if (!allowChatMessage(rateKey)) {
            socket.send(
              JSON.stringify({
                type: "error",
                code: "SRV_003",
                message: "rate limited",
              }),
            );
            return;
          }

          const stream = await prisma.stream.findFirst({
            where: { id: streamId },
            select: { id: true },
          });
          if (!stream) {
            socket.send(
              JSON.stringify({
                type: "error",
                code: "SRV_002",
                message: "stream not found",
              }),
            );
            return;
          }

          const row = await prisma.liveChatMessage.create({
            data: {
              streamId,
              userId: state.user.sub,
              body: chatText,
            },
          });

          const outgoing = JSON.stringify({
            type: "chat:receive",
            payload: {
              id: row.id,
              streamId: row.streamId,
              userId: row.userId,
              username: state.user.username,
              text: row.body,
              createdAt: row.createdAt.toISOString(),
            },
          });

          try {
            await getRedisBus().publish(streamId, outgoing);
          } catch (err) {
            app.log.warn({ err }, "redis publish failed; local broadcast only");
            broadcastLocal(streamId, outgoing);
          }
          return;
        }

        if (msg.type === "reaction:send") {
          const streamId = msg.streamId ?? state.streamId;
          const reaction = msg.reaction?.trim();
          if (!streamId || !reaction?.length) {
            socket.send(
              JSON.stringify({
                type: "error",
                code: "VAL_001",
                message: "streamId and reaction are required",
              }),
            );
            return;
          }
          const outgoing = JSON.stringify({
            type: "reaction:receive",
            payload: {
              streamId,
              userId: state.user.sub,
              username: state.user.username,
              reaction,
              createdAt: new Date().toISOString(),
            },
          });
          try {
            await getRedisBus().publish(streamId, outgoing);
          } catch (err) {
            app.log.warn({ err }, "redis publish failed; local broadcast only");
            broadcastLocal(streamId, outgoing);
          }
          return;
        }

        socket.send(
          JSON.stringify({
            type: "error",
            code: "VAL_001",
            message: `unknown type: ${msg.type ?? ""}`,
          }),
        );
      });

      socket.on("close", () => {
        removeFromAllRooms(socket);
        clientMeta.delete(socket);
      });
    },
  );
};
