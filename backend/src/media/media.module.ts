import { Module } from '@nestjs/common';
import { MediaService } from './media.service';

@Module({
  providers: [MediaService],
  exports: [MediaService], // 👈 IMPORTANT
})
export class MediaModule {}
