import { Server, Socket } from 'socket.io';
import { GameService } from '../services/game.js';
import type { JoinRoomPayload, StartRoundPayload, MoveCharacterPayload } from '@podorank/shared';

const gameService = new GameService();

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join room
    socket.on('join-room', async (payload: JoinRoomPayload) => {
      const { roomId, nickname, isMaster = false } = payload;

      try {
        const player = await gameService.joinRoom(roomId, socket.id, nickname, isMaster);
        socket.join(roomId);

        // Notify others in room
        socket.to(roomId).emit('player-joined', player);

        // Send room state to the joining player
        const roomState = await gameService.getRoomState(roomId);
        socket.emit('room-state', roomState);
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Start round (master only)
    socket.on('start-round', async (payload: StartRoundPayload) => {
      const { roomId } = payload;

      try {
        const round = await gameService.startRound(roomId, socket.id);
        io.to(roomId).emit('round-start', round);

        // Start timer
        gameService.startTimer(roomId, round.duration, (timeLeft) => {
          io.to(roomId).emit('timer-update', { timeLeft });
        }, async () => {
          const results = await gameService.endRound(roomId);
          io.to(roomId).emit('round-end', results);
        });
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Move character
    socket.on('move-character', (payload: MoveCharacterPayload) => {
      const { roomId, position } = payload;

      // Broadcast position to others in room
      socket.to(roomId).emit('character-move', {
        playerId: socket.id,
        position,
      });

      // Update position in game state
      gameService.updatePlayerPosition(roomId, socket.id, position);
    });

    // Select wine (when timer ends or player confirms)
    socket.on('select-wine', async (payload: { roomId: string; wineId: number }) => {
      const { roomId, wineId } = payload;

      try {
        await gameService.selectWine(roomId, socket.id, wineId);
        io.to(roomId).emit('selection-update', {
          playerId: socket.id,
          wineId,
        });
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      gameService.handleDisconnect(socket.id);
    });
  });
}
