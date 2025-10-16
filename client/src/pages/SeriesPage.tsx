import { useParams, useNavigate } from "react-router-dom";
import { useSeriesVideos } from "@/hooks/useSeriesVideos";
import { useSeries } from "@/hooks/useSeries";
import { Play } from "lucide-react";

export default function SeriesPage() {
  const { id = "" } = useParams();
  const { data: videos = [], isLoading } = useSeriesVideos(id, !!id);
  const { data: series } = useSeries();
  const navigate = useNavigate();

  const currentSeries = series?.find(s => s.id === id);

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="pt-24 px-4 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-4">{currentSeries?.title}</h1>
      <p className="text-gray-400 mb-6">{currentSeries?.description}</p>
      <div className="space-y-4">
        {videos.map((v) => (
          <div key={v.id} className="flex gap-4 items-center bg-dharma-dark-light p-3 rounded cursor-pointer" onClick={() => navigate(`/watch/${v.id}`)}>
            <img src={v.thumbnail_url} alt={v.title} className="w-32 h-18 object-cover rounded" />
            <div className="flex-1">
              <p className="font-semibold text-white">Ep {v.episode_number}: {v.title}</p>
              <p className="text-xs text-gray-400 line-clamp-2">{v.description}</p>
            </div>
            <Play className="w-6 h-6 text-dharma-gold" />
          </div>
        ))}
      </div>
    </div>
  );
}
