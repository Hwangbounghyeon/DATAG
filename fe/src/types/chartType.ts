export interface DataPoint {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface ScatterPlotProps {
  data: DataPoint[];
  onSelectPoints?: (points: string[]) => void;
}