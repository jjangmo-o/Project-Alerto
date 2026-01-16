export type FloodZone = {
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high';
    polygon: [number, number][];
};
