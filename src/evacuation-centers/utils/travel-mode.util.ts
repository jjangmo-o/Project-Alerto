import { TravelMode } from '../types/travel-mode.type';

export function isValidTravelMode(
  mode: string,
): mode is TravelMode {
  return ['walking', 'driving', 'two-wheeler'].includes(mode);
}
