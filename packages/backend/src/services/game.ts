import { RoomService } from './room.js';
import type { Room, Player, GameRound, Position, RoundResult } from '@podorank/shared';
import { ROUND_CONFIG } from '@podorank/shared';

const roomService = new RoomService();

// Track active timers
const activeTimers = new Map<string, NodeJS.Timeout>();

// Track player positions and selections during rounds
const roundStates = new Map<string, {
  positions: Map<string, Position>;
  selections: Map<string, number>;
}>();

// Map socket ID to room ID for disconnect handling
const playerRooms = new Map<string, string>();

// Color palette for players
const PLAYER_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33',
  '#33FFF5', '#FF8C33', '#8C33FF', '#33FF8C', '#FF3333',
  '#33FFFF', '#FFFF33', '#FF33FF', '#33FF33', '#3333FF',
  '#FF6B6B', '#6B6BFF', '#6BFF6B', '#FFB86B', '#6BFFB8',
];

export class GameService {
  async joinRoom(roomId: string, socketId: string, nickname: string, isMaster: boolean = false): Promise<Player> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
      throw new Error('Game already started');
    }

    // Check if nickname already exists
    if (room.participants.some(p => p.nickname === nickname)) {
      throw new Error('Nickname already taken');
    }

    const player: Player = {
      playerId: socketId,
      nickname,
      color: PLAYER_COLORS[room.participants.length % PLAYER_COLORS.length],
    };

    room.participants.push(player);

    // If joining as master, update the masterId to this socket
    const updates: Partial<Room> = { participants: room.participants };
    if (isMaster) {
      updates.masterId = socketId;
    }

    await roomService.updateRoom(roomId, updates);

    playerRooms.set(socketId, roomId);

    return player;
  }

  async getRoomState(roomId: string): Promise<Room | null> {
    return roomService.getRoom(roomId);
  }

  async startRound(roomId: string, socketId: string): Promise<GameRound> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.masterId !== socketId) {
      throw new Error('Only the master can start rounds');
    }

    const nextRound = room.currentRound + 1;
    if (nextRound > 6) {
      throw new Error('All rounds completed');
    }

    const config = ROUND_CONFIG[nextRound - 1];
    const wineIndices = this.selectWinesForRound(room.wines.length, config.wineCount, nextRound);

    // Initialize round state
    roundStates.set(roomId, {
      positions: new Map(),
      selections: new Map(),
    });

    await roomService.updateRoom(roomId, {
      status: 'in_progress',
      currentRound: nextRound,
    });

    return {
      roomId,
      roundNum: nextRound,
      wineIds: wineIndices.map(i => room.wines[i].id),
      wines: wineIndices.map(i => room.wines[i]),
      duration: config.duration,
      startTime: new Date().toISOString(),
    };
  }

  startTimer(
    roomId: string,
    duration: number,
    onTick: (timeLeft: number) => void,
    onEnd: () => void
  ): void {
    let timeLeft = duration;

    const timer = setInterval(() => {
      timeLeft--;
      onTick(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        activeTimers.delete(roomId);
        onEnd();
      }
    }, 1000);

    activeTimers.set(roomId, timer);
  }

  updatePlayerPosition(roomId: string, playerId: string, position: Position): void {
    const state = roundStates.get(roomId);
    if (state) {
      state.positions.set(playerId, position);
    }
  }

  async selectWine(roomId: string, playerId: string, wineId: number): Promise<void> {
    const state = roundStates.get(roomId);
    if (state) {
      state.selections.set(playerId, wineId);
    }
  }

  async endRound(roomId: string): Promise<RoundResult> {
    const room = await roomService.getRoom(roomId);
    const state = roundStates.get(roomId);

    if (!room || !state) {
      throw new Error('Room or round state not found');
    }

    // Convert selections to result format
    const selections: RoundResult['selections'] = {};
    state.selections.forEach((wineId, playerId) => {
      const player = room.participants.find(p => p.playerId === playerId);
      if (player) {
        selections[player.nickname] = {
          wineId,
          wineName: room.wines.find(w => w.id === wineId)?.name || 'Unknown',
        };
      }
    });

    // Clear round state
    roundStates.delete(roomId);

    // Check if game is finished
    if (room.currentRound >= 6) {
      await roomService.updateRoom(roomId, {
        status: 'finished',
        finishedAt: new Date().toISOString(),
      });
    }

    return {
      roomId,
      roundNum: room.currentRound,
      selections,
      isGameOver: room.currentRound >= 6,
    };
  }

  handleDisconnect(socketId: string): void {
    const roomId = playerRooms.get(socketId);
    if (roomId) {
      playerRooms.delete(socketId);
      // Optionally remove player from room or mark as disconnected
    }
  }

  private selectWinesForRound(totalWines: number, count: number, roundNum: number): number[] {
    // Pre-defined combinations for 5 wines across 6 rounds
    const combinations: number[][] = [
      [0, 1],           // Round 1: 2 wines
      [0, 2],           // Round 2: 2 wines
      [1, 2, 3],        // Round 3: 3 wines
      [0, 3, 4],        // Round 4: 3 wines
      [1, 2, 3, 4],     // Round 5: 4 wines
      [0, 1, 2, 3, 4],  // Round 6: all 5 wines
    ];

    return combinations[roundNum - 1] || combinations[0];
  }
}
