import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui';

interface WineInput {
  name: string;
}

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const [wines, setWines] = useState<WineInput[]>([
    { name: '' },
    { name: '' },
    { name: '' },
    { name: '' },
    { name: '' },
  ]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateWine = (index: number, name: string) => {
    const newWines = [...wines];
    newWines[index] = { name };
    setWines(newWines);
  };

  const handleCreateRoom = async () => {
    const filledWines = wines.filter(w => w.name.trim());
    if (filledWines.length < 2) {
      alert('와인을 최소 2개 이상 입력해주세요');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterId: crypto.randomUUID(),
          wines: filledWines.map((w, i) => ({ id: i + 1, name: w.name })),
        }),
      });

      const data = await response.json();
      setRoomId(data.roomId);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('방 생성에 실패했습니다');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const joinUrl = roomId ? `${window.location.origin}/join/${roomId}` : '';

  // 방 생성 완료 화면
  if (roomId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-lg">
        <h1 className="text-h1 text-primary-700 mb-xl">방이 생성되었습니다!</h1>

        {/* QR 코드 */}
        <div className="bg-white p-lg rounded-lg shadow-md mb-lg">
          <QRCodeSVG value={joinUrl} size={200} />
        </div>

        {/* 방 코드 */}
        <div className="flex items-center gap-md mb-md">
          <span className="text-display font-mono font-bold text-primary-700">
            {roomId}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-sm rounded-md hover:bg-neutral-100 transition-colors"
            title="코드 복사"
          >
            {copied ? (
              <Check className="w-6 h-6 text-success-500" />
            ) : (
              <Copy className="w-6 h-6 text-neutral-500" />
            )}
          </button>
        </div>

        <p className="text-body text-neutral-500 mb-xl text-center">
          QR 코드를 스캔하거나 방 코드를 공유하세요
        </p>

        <Button
          size="lg"
          onClick={() => navigate(`/room/${roomId}?master=true`)}
        >
          마스터로 입장
        </Button>
      </div>
    );
  }

  // 방 생성 폼
  return (
    <div className="min-h-screen flex flex-col p-lg pt-xl">
      {/* 헤더 */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-sm text-neutral-500 hover:text-neutral-700 mb-xl"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-body">돌아가기</span>
      </button>

      <h1 className="text-h1 text-primary-700 mb-lg text-center">
        방 만들기
      </h1>

      {/* 와인 입력 폼 */}
      <div className="w-full max-w-md mx-auto space-y-md mb-xl">
        <p className="text-body text-neutral-500 mb-md">
          오늘 마실 와인을 입력하세요 (최소 2개)
        </p>

        {wines.map((wine, index) => (
          <div key={index} className="flex items-center gap-md">
            <span className="text-body font-semibold text-primary-700 w-8">
              {index + 1}.
            </span>
            <input
              type="text"
              value={wine.name}
              onChange={(e) => updateWine(index, e.target.value)}
              placeholder={`와인 ${index + 1}`}
              className="
                flex-1 px-md py-sm
                bg-white border border-neutral-300 rounded-sm
                focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                text-body text-neutral-900
                placeholder:text-neutral-500
              "
            />
          </div>
        ))}
      </div>

      {/* 생성 버튼 */}
      <div className="w-full max-w-md mx-auto">
        <Button
          size="lg"
          className="w-full"
          onClick={handleCreateRoom}
          isLoading={isCreating}
        >
          {isCreating ? '생성 중...' : '방 만들기'}
        </Button>
      </div>
    </div>
  );
}
