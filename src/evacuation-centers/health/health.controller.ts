import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'Project Alerto Backend',
      timestamp: new Date().toISOString(),
    };
  }
}
