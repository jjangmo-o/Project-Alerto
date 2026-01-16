export type EarthquakeZone = {
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high';
    polygon: [number, number][];
};
