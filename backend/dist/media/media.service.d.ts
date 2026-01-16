export declare class MediaService {
    uploadFiles(files: Express.Multer.File[]): Promise<{
        url: string;
        type: string;
    }[]>;
}
