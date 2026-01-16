import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {

  async uploadFiles(files: Express.Multer.File[]) {
    // Temporary stub (no Cloudinary yet)
    return files.map((file, index) => ({
      url: `https://fake.cdn/project-alerto/${Date.now()}_${index}`,
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
    }));
  }

}
