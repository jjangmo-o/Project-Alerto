declare module '@mapbox/mapbox-gl-geocoder' {
  import { IControl } from 'mapbox-gl';

  interface MapboxGeocoderOptions {
    accessToken: string;
    mapboxgl: any;
    marker?: boolean;
    placeholder?: string;
    zoom?: number;
  }

  export default class MapboxGeocoder implements IControl {
    constructor(options: MapboxGeocoderOptions);
    on(type: string, fn: (event: any) => void): void;
    addTo(container: HTMLElement): void;
    clear(): void;
    onAdd(map: any): HTMLElement;
    onRemove(): void;
  }
}
