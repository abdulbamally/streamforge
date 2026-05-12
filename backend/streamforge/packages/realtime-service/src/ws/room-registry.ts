import { WebSocket } from "ws";

type Room = Set<WebSocket>;

const rooms = new Map<string, Room>();

export function addToRoom(streamId: string, socket: WebSocket) {
  let room = rooms.get(streamId);
  if (!room) {
    room = new Set();
    rooms.set(streamId, room);
  }
  room.add(socket);
}

export function removeFromRoom(streamId: string, socket: WebSocket) {
  const room = rooms.get(streamId);
  if (!room) return;
  room.delete(socket);
  if (room.size === 0) {
    rooms.delete(streamId);
  }
}

export function removeFromAllRooms(socket: WebSocket) {
  for (const [streamId, room] of rooms) {
    if (room.delete(socket) && room.size === 0) {
      rooms.delete(streamId);
    }
  }
}

export function broadcastLocal(streamId: string, payload: string) {
  const room = rooms.get(streamId);
  if (!room) return;
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
