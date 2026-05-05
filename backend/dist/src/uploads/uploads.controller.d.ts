interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}
export declare class UploadsController {
    uploadImage(file: MulterFile): {
        url: string;
    };
}
export {};
