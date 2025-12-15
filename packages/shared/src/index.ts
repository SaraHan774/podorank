// === Room Types ===

export interface Wine {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface Player {
  playerId: string;
  nickname: string;
  color: string;
}

export type RoomStatus = 'waiting' | 'in_progress' | 'finished';

export interface Room {
  roomId: string;
  masterId: string;
  status: RoomStatus;
  wines: Wine[];
  participants: Player[];
  currentRound: number;
  createdAt: string;
  finishedAt: string | null;
}

// === Game Round Types ===

export interface GameRound {
  roomId: string;
  roundNum: number;
  wineIds: number[];
  wines: Wine[];
  duration: number;
  startTime: string;
}

export interface RoundResult {
  roomId: string;
  roundNum: number;
  selections: {
    [nickname: string]: {
      wineId: number;
      wineName: string;
    };
  };
  isGameOver: boolean;
}

// === Position Types ===

export interface Position {
  x: number;
  y: number;
}

// === Statistics Types ===

export interface WineStat {
  name: string;
  selectedBy: string[];
  totalSelections: number;
}

export interface PlayerStat {
  selections: number[];
  selectionCount: { [wineId: string]: number };
}

export interface RoomStats {
  roomId: string;
  sessionDate: string;
  wineStats: { [wineId: number]: WineStat };
  playerStats: { [nickname: string]: PlayerStat };
  createdAt: string;
}

// === Socket Event Payloads ===

export interface JoinRoomPayload {
  roomId: string;
  nickname: string;
  isMaster?: boolean;
}

export interface StartRoundPayload {
  roomId: string;
}

export interface MoveCharacterPayload {
  roomId: string;
  position: Position;
}

export interface SelectWinePayload {
  roomId: string;
  wineId: number;
}

// === Socket Event Types (Server -> Client) ===

export interface PlayerJoinedEvent {
  player: Player;
}

export interface RoundStartEvent {
  round: GameRound;
}

export interface TimerUpdateEvent {
  timeLeft: number;
}

export interface CharacterMoveEvent {
  playerId: string;
  position: Position;
}

export interface SelectionUpdateEvent {
  playerId: string;
  wineId: number;
}

export interface RoundEndEvent {
  results: RoundResult;
}

export interface GameFinishedEvent {
  stats: RoomStats;
}

export interface ErrorEvent {
  message: string;
}

// === Game Configuration ===

export interface RoundConfig {
  roundNum: number;
  wineCount: number;
  duration: number;
}

export const ROUND_CONFIG: RoundConfig[] = [
  { roundNum: 1, wineCount: 2, duration: 30 },
  { roundNum: 2, wineCount: 2, duration: 28 },
  { roundNum: 3, wineCount: 3, duration: 27 },
  { roundNum: 4, wineCount: 3, duration: 25 },
  { roundNum: 5, wineCount: 4, duration: 22 },
  { roundNum: 6, wineCount: 5, duration: 20 },
];

// === API Request/Response Types ===

export interface CreateRoomRequest {
  masterId: string;
  wines: Omit<Wine, 'id'>[];
}

export interface CreateRoomResponse {
  room: Room;
  qrCodeUrl?: string;
}
