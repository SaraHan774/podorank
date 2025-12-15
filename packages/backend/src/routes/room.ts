import { Router } from 'express';
import { RoomService } from '../services/room.js';

const router = Router();
const roomService = new RoomService();

// Create a new room
router.post('/', async (req, res) => {
  try {
    const { masterId, wines } = req.body;
    const room = await roomService.createRoom(masterId, wines);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get room by ID
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await roomService.getRoom(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get room statistics
router.get('/:roomId/stats', async (req, res) => {
  try {
    const { roomId } = req.params;
    const stats = await roomService.getRoomStats(roomId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export { router as roomRoutes };
