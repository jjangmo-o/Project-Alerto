import { Injectable } from '@nestjs/common';
import { HazardEventsGateway } from './hazard-events.gateway';


@Injectable()
export class HazardEventsService {
  private floodActive = false;
  private earthquakeActive = false;

  constructor(private readonly gateway: HazardEventsGateway) {}

  // ============================
  // READ-ONLY STATUS (USED BY ROUTING)
  // ============================

  isFloodEventActive(): boolean {
    return this.floodActive;
  }

  isEarthquakeEventActive(): boolean {
    return this.earthquakeActive;
  }

  getStatus() {
    return {
      flood: this.floodActive,
      earthquake: this.earthquakeActive,
    };
  }

  // ============================
  // ADMIN CONTROLS (EXPLICIT)
  // ============================

  enableFloodEvent() {
  this.floodActive = true;

  this.gateway.emitHazardStatus(this.getStatus());

  return this.getStatus();
}


  disableFloodEvent() {
    this.floodActive = false;
    this.gateway.emitHazardStatus(this.getStatus());
    return this.getStatus();
  }

  enableEarthquakeEvent() {
    this.earthquakeActive = true;
    this.gateway.emitHazardStatus(this.getStatus());
    return this.getStatus();
  }

  disableEarthquakeEvent() {
    this.earthquakeActive = false;
    this.gateway.emitHazardStatus(this.getStatus());
    return this.getStatus();
  }
}
