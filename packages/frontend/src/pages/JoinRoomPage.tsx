import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Grape } from '../components/ui';

export default function JoinRoomPage() {
  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState(urlRoomId || '');
  const [nickname, setNickname] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('podorank_nickname');
    if (saved) setNickname(saved);
  }, []);

  const handleJoin = async () => {
    if (!roomId.trim() || !nickname.trim()) {
      alert('방 코드와 닉네임을 입력해주세요');
      return;
    }

    localStorage.setItem('podorank_nickname', nickname);

    setIsJoining(true);
    try {
      const response = await fetch(`/api/rooms/${roomId.toUpperCase()}`);
      if (!response.ok) {
        throw new Error('Room not found');
      }

      navigate(`/room/${roomId.toUpperCase()}?nickname=${encodeURIComponent(nickname)}`);
    } catch (error) {
      alert('방을 찾을 수 없습니다. 코드를 확인해주세요.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-lg">
      {/* 헤더 */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-sm text-neutral-500 hover:text-neutral-700 mb-xl"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-body">돌아가기</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* 포도알 데코 */}
        <Grape color="#A91E2D" size={64} animated className="mb-lg" />

        <h1 className="text-h1 text-primary-700 mb-xl">참여하기</h1>

        <div className="w-full max-w-xs space-y-lg">
          {/* 방 코드 입력 */}
          <div>
            <label className="block text-body-sm text-neutral-700 mb-sm font-semibold">
              방 코드
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="
                w-full px-md py-md
                bg-white border border-neutral-300 rounded-sm
                focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                text-h1 text-neutral-900 text-center font-mono tracking-widest
                placeholder:text-neutral-300
              "
            />
          </div>

          {/* 닉네임 입력 */}
          <div>
            <label className="block text-body-sm text-neutral-700 mb-sm font-semibold">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
              maxLength={10}
              className="
                w-full px-md py-md
                bg-white border border-neutral-300 rounded-sm
                focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                text-body text-neutral-900 text-center
                placeholder:text-neutral-500
              "
            />
          </div>

          {/* 참여 버튼 */}
          <Button
            size="lg"
            className="w-full mt-lg"
            onClick={handleJoin}
            isLoading={isJoining}
          >
            {isJoining ? '입장 중...' : '게임 참여'}
          </Button>
        </div>
      </div>
    </div>
  );
}
