import { Controller, Get } from '@nestjs/common';

@Controller('barangays')
export class BarangaysController {

  @Get()
  findAll() {
    return { message: 'Barangays endpoint (stub)' };
  }

}
