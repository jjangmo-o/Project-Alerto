export type EvacuationCenterStatus = 'OPEN' | 'FULL' | 'CLOSED';
export interface EvacuationCenter {
    id: string;
    name: string;
    barangayId: string;
    latitude: number;
    longitude: number;
    capacity: number;
    status: EvacuationCenterStatus;
}
export declare const EVACUATION_CENTERS: EvacuationCenter[];
