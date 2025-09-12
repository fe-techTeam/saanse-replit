import { useSeries } from "@/hooks/useSeries";
import { Link } from "react-router-dom";

export function SeriesRow() {
  const { data: series = [], isLoading } = useSeries();

  if (isLoading) return <p className="px-4">Loading series...</p>;

  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold px-4 mb-4">Series</h3>
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide px-4">
        {series.map((s) => (
          <Link key={s.id} to={`/series/${s.id}`} className="flex-shrink-0 w-40">
            <div className="bg-dharma-dark-light rounded-lg overflow-hidden">
              <img src={s.thumbnail_url} alt={s.title} className="w-full h-24 object-cover" />
              <div className="p-3">
                <h4 className="text-sm font-medium line-clamp-2">{s.title}</h4>
                <p className="text-xs text-gray-400">{s.total_episodes} Episodes</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
