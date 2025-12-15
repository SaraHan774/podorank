import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import GameRoomPage from './pages/GameRoomPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/join/:roomId" element={<JoinRoomPage />} />
        <Route path="/room/:roomId" element={<GameRoomPage />} />
        <Route path="/results/:roomId" element={<ResultsPage />} />
      </Routes>
    </div>
  );
}

export default App;
