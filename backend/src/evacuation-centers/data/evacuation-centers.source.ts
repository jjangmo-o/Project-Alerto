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

export const EVACUATION_CENTERS: EvacuationCenter[] = [
  {
    id: 'ec-1',
    name: 'Marikina Sports Center',
    barangayId: 'barangay-sta-elena',
    latitude: 14.6507,
    longitude: 121.1029,
    capacity: 500,
    status: 'OPEN',
  },
  {
    id: 'ec-2',
    name: 'Barangka Elementary School',
    barangayId: 'barangay-barangka',
    latitude: 14.6415,
    longitude: 121.0863,
    capacity: 300,
    status: 'OPEN',
  },
];
