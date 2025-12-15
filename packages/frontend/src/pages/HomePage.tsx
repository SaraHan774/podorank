import { Link } from 'react-router-dom';
import { Grape } from '../components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-lg">
      {/* 로고 영역 */}
      <div className="text-center mb-2xl">
        {/* 포도알 데코레이션 */}
        <div className="flex justify-center gap-sm mb-lg">
          <Grape color="#A91E2D" size={48} animated />
          <Grape color="#6B3FA0" size={56} animated />
          <Grape color="#A91E2D" size={48} animated />
        </div>

        <h1 className="text-display text-primary-700 mb-sm">
          PodoRank
        </h1>
        <p className="text-body-lg text-neutral-500">
          와인 테이스팅 게임
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col gap-md w-full max-w-xs">
        <Link
          to="/create"
          className="
            bg-primary-700 hover:bg-primary-900
            text-white font-semibold
            py-lg px-xl
            rounded-md text-center
            transition-all duration-200
            shadow-md hover:shadow-lg
            min-h-[52px] flex items-center justify-center
          "
        >
          방 만들기
        </Link>
        <Link
          to="/join"
          className="
            bg-neutral-100 hover:bg-neutral-200
            text-neutral-900 font-semibold
            py-lg px-xl
            rounded-md text-center
            transition-all duration-200
            border border-neutral-200
            min-h-[52px] flex items-center justify-center
          "
        >
          참여하기
        </Link>
      </div>

      {/* 설명 텍스트 */}
      <p className="mt-2xl text-body-sm text-neutral-500 text-center max-w-xs">
        포도알을 움직여 마음에 드는 와인을 선택하세요!
      </p>
    </div>
  );
}
