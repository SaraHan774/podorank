import { Trophy } from 'lucide-react';
import type { RoundResult } from '@podorank/shared';
import { Button, Card } from './ui';

interface RoundResultsProps {
  result: RoundResult;
  onContinue: () => void;
  isMaster: boolean;
}

export default function RoundResults({ result, onContinue, isMaster }: RoundResultsProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-lg">
      <h2 className="text-h1 font-bold text-primary-700 mb-xl">
        Round {result.roundNum} 결과
      </h2>

      {/* 선택 결과 목록 */}
      <div className="w-full max-w-md space-y-sm mb-xl">
        {Object.entries(result.selections).map(([nickname, selection]) => (
          <Card key={nickname} className="flex justify-between items-center">
            <span className="text-body font-semibold text-neutral-900">
              {nickname}
            </span>
            <span className="text-body text-primary-700 font-medium">
              → {selection.wineName}
            </span>
          </Card>
        ))}

        {Object.keys(result.selections).length === 0 && (
          <p className="text-body text-neutral-500 text-center">
            선택한 플레이어가 없습니다
          </p>
        )}
      </div>

      {/* 게임 종료 */}
      {result.isGameOver ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-sm mb-md">
            <Trophy className="w-8 h-8 text-accent-gold" />
            <p className="text-h1 text-primary-700 font-bold">
              게임 종료!
            </p>
          </div>
          <Button size="lg" onClick={onContinue}>
            최종 결과 보기
          </Button>
        </div>
      ) : (
        isMaster && (
          <Button size="lg" onClick={onContinue}>
            다음 라운드
          </Button>
        )
      )}

      {!isMaster && !result.isGameOver && (
        <p className="text-body text-neutral-500">
          다음 라운드를 기다리는 중...
        </p>
      )}
    </div>
  );
}
