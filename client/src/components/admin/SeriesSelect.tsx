import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSeries } from "@/hooks/useSeries";

interface SeriesSelectProps {
  value?: string;
  onChange: (id: string) => void;
  onCreateNew: () => void; // open create series dialog
}

export function SeriesSelect({ value, onChange, onCreateNew }: SeriesSelectProps) {
  const { data: series } = useSeries();

  return (
    <div className="flex items-center gap-2 w-full">
      <Select onValueChange={onChange} defaultValue={value}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select series" />
        </SelectTrigger>
        <SelectContent>
          {series?.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="icon" variant="outline" onClick={onCreateNew} title="New series">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
