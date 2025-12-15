import { v4 as uuidv4 } from 'uuid';
import type { Room, Wine, RoomStats } from '@podorank/shared';

// In-memory storage for MVP (replace with PostgreSQL later)
const rooms = new Map<string, Room>();

export class RoomService {
  async createRoom(masterId: string, wines: Wine[]): Promise<Room> {
    const roomId = this.generateRoomId();

    const room: Room = {
      roomId,
      masterId,
      status: 'waiting',
      wines,
      participants: [],
      currentRound: 0,
      createdAt: new Date().toISOString(),
      finishedAt: null,
    };

    rooms.set(roomId, room);
    return room;
  }

  async getRoom(roomId: string): Promise<Room | null> {
    return rooms.get(roomId) || null;
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null> {
    const room = rooms.get(roomId);
    if (!room) return null;

    const updatedRoom = { ...room, ...updates };
    rooms.set(roomId, updatedRoom);
    return updatedRoom;
  }

  async getRoomStats(roomId: string): Promise<RoomStats | null> {
    const room = rooms.get(roomId);
    if (!room) return null;

    // Calculate wine statistics
    const wineStats: RoomStats['wineStats'] = {};
    room.wines.forEach((wine) => {
      wineStats[wine.id] = {
        name: wine.name,
        selectedBy: [],
        totalSelections: 0,
      };
    });

    // Calculate player statistics
    const playerStats: RoomStats['playerStats'] = {};
    room.participants.forEach((player) => {
      playerStats[player.nickname] = {
        selections: [],
        selectionCount: {},
      };
    });

    return {
      roomId,
      sessionDate: room.createdAt.split('T')[0],
      wineStats,
      playerStats,
      createdAt: room.createdAt,
    };
  }

  private generateRoomId(): string {
    // Generate a short, readable room ID
    return uuidv4().substring(0, 6).toUpperCase();
  }
}
