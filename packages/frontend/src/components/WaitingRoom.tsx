import { Users, Wine } from 'lucide-react';
import type { Room } from '@podorank/shared';
import { Button, Grape, getGrapeColorByIndex } from './ui';

interface WaitingRoomProps {
  room: Room | null;
  isMaster: boolean;
  onStartRound: () => void;
}

export default function WaitingRoom({ room, isMaster, onStartRound }: WaitingRoomProps) {
  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-body text-neutral-500">방 정보를 불러오는 중...</p>
      </div>
    );
  }

  const currentRound = room.currentRound;
  const isGameStarted = currentRound > 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-lg">
      {/* 라운드 표시 */}
      <div className="mb-xl text-center">
        <span className="text-display font-bold text-primary-700">
          {isGameStarted ? `Round ${currentRound + 1}` : '준비됐나요?'}
        </span>
        {isGameStarted && (
          <p className="text-body text-neutral-500 mt-sm">
            다음 라운드를 시작합니다
          </p>
        )}
      </div>

      {/* 플레이어 목록 */}
      <div className="mb-xl w-full max-w-md">
        <div className="flex items-center justify-center gap-sm mb-md">
          <Users className="w-5 h-5 text-neutral-500" />
          <h3 className="text-h2 text-neutral-700">
            참가자 ({room.participants.length}명)
          </h3>
        </div>
        <div className="flex flex-wrap justify-center gap-sm">
          {room.participants.map((player, index) => (
            <div
              key={player.playerId}
              className="flex items-center gap-xs px-md py-sm bg-white rounded-full shadow-sm"
            >
              <Grape
                color={player.color || getGrapeColorByIndex(index)}
                size={24}
              />
              <span className="text-body font-medium text-neutral-700">
                {player.nickname}
              </span>
            </div>
          ))}
          {room.participants.length === 0 && (
            <p className="text-body-sm text-neutral-500">
              아직 참가자가 없습니다
            </p>
          )}
        </div>
      </div>

      {/* 와인 목록 */}
      <div className="mb-xl w-full max-w-md">
        <div className="flex items-center justify-center gap-sm mb-md">
          <Wine className="w-5 h-5 text-primary-700" />
          <h3 className="text-h2 text-neutral-700">
            오늘의 와인
          </h3>
        </div>
        <div className="space-y-sm">
          {room.wines.map((wine, index) => (
            <div
              key={wine.id}
              className="bg-white rounded-md p-md shadow-sm flex items-center gap-md border border-neutral-200"
            >
              <span className="text-body font-semibold text-primary-700 w-6">
                {index + 1}.
              </span>
              <span className="text-body text-neutral-900">{wine.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 시작 버튼 (마스터만) */}
      {isMaster && (
        <Button
          size="lg"
          onClick={onStartRound}
          className="animate-pulse-fast"
        >
          {isGameStarted ? '다음 라운드' : '게임 시작'}
        </Button>
      )}

      {!isMaster && (
        <p className="text-body text-neutral-500">
          마스터가 시작하기를 기다리는 중...
        </p>
      )}
    </div>
  );
}
