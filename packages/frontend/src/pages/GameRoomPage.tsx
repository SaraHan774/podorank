import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import GameCanvas3D from '../components/GameCanvas3D';
import WaitingRoom from '../components/WaitingRoom';
import RoundResults from '../components/RoundResults';
import { InlineTimer } from '../components/ui';
import type { Room, GameRound, RoundResult } from '@podorank/shared';

type GamePhase = 'waiting' | 'playing' | 'round-end' | 'finished';

export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isMaster = searchParams.get('master') === 'true';
  const nickname = searchParams.get('nickname') || 'Master';

  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState<Room | null>(null);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    socket.emit('join-room', { roomId, nickname, isMaster });

    socket.on('room-state', (state: Room) => {
      setRoom(state);
    });

    socket.on('player-joined', (player) => {
      setRoom((prev) =>
        prev ? { ...prev, participants: [...prev.participants, player] } : prev
      );
    });

    socket.on('round-start', (round: GameRound) => {
      setCurrentRound(round);
      setPhase('playing');
      setTimeLeft(round.duration);
    });

    socket.on('timer-update', ({ timeLeft: t }) => {
      setTimeLeft(t);
    });

    socket.on('round-end', (result: RoundResult) => {
      setRoundResult(result);
      setPhase('round-end');
    });

    socket.on('game-finished', () => {
      navigate(`/results/${roomId}`);
    });

    socket.on('error', ({ message }) => {
      alert(message);
    });

    return () => {
      socket.off('room-state');
      socket.off('player-joined');
      socket.off('round-start');
      socket.off('timer-update');
      socket.off('round-end');
      socket.off('game-finished');
      socket.off('error');
    };
  }, [socket, isConnected, roomId, nickname, navigate]);

  const handleStartRound = () => {
    if (socket && roomId) {
      socket.emit('start-round', { roomId });
    }
  };

  const handleContinue = () => {
    if (roundResult?.isGameOver) {
      navigate(`/results/${roomId}`);
    } else {
      setPhase('waiting');
      setRoundResult(null);
    }
  };

  // 연결 중
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-md">
        <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
        <p className="text-body text-neutral-500">연결 중...</p>
      </div>
    );
  }

  // 게임 플레이 중에는 풀스크린
  if (phase === 'playing' && currentRound && room && socket) {
    return (
      <GameCanvas3D
        round={currentRound}
        room={room}
        socket={socket}
        timeLeft={timeLeft}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm p-md flex justify-between items-center border-b border-neutral-200">
        <div className="flex items-center gap-md">
          <span className="text-body font-mono font-bold text-primary-700">
            {roomId}
          </span>
          {room && (
            <div className="flex items-center gap-xs text-neutral-500">
              <Users className="w-4 h-4" />
              <span className="text-body-sm">
                {room.participants.length}명
              </span>
            </div>
          )}
        </div>
        {phase === 'playing' && (
          <InlineTimer seconds={timeLeft} />
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col">
        {phase === 'waiting' && (
          <WaitingRoom
            room={room}
            isMaster={isMaster}
            onStartRound={handleStartRound}
          />
        )}

        {phase === 'round-end' && roundResult && (
          <RoundResults
            result={roundResult}
            onContinue={handleContinue}
            isMaster={isMaster}
          />
        )}
      </main>
    </div>
  );
}
