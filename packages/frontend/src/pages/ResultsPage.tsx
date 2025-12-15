import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { RoomStats } from '@podorank/shared';

export default function ResultsPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/rooms/${roomId}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Results not found</p>
        <Link to="/" className="text-grape-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-8">
      <h1 className="text-3xl font-bold text-grape-700 text-center mb-8">
        Game Results
      </h1>

      {/* Wine Statistics */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Wine Selections
        </h2>
        <div className="space-y-4">
          {Object.entries(stats.wineStats).map(([wineId, wine]) => (
            <div
              key={wineId}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">wine</span>
                <span className="font-semibold text-gray-800">{wine.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                {wine.selectedBy.length > 0
                  ? `Selected by: ${wine.selectedBy.join(', ')}`
                  : 'No selections'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Total: {wine.totalSelections} selections
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Player Statistics */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Player Stats
        </h2>
        <div className="space-y-4">
          {Object.entries(stats.playerStats).map(([nickname, player]) => (
            <div
              key={nickname}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="font-semibold text-gray-800 mb-2">
                {nickname}
              </div>
              <div className="text-sm text-gray-600">
                {Object.entries(player.selectionCount).map(([wineId, count]) => (
                  <span key={wineId} className="mr-3">
                    Wine {wineId}: {'X'.repeat(count as number)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Back to Home */}
      <div className="text-center mt-8">
        <Link
          to="/"
          className="inline-block bg-grape-600 hover:bg-grape-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
