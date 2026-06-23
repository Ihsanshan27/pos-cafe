export declare const imageDir: string;
type SaveOptimizedImageOptions = {
    buffer: Buffer;
    prefix: string;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
};
export declare function saveOptimizedImage({ buffer, prefix, maxWidth, maxHeight, quality, }: SaveOptimizedImageOptions): Promise<{
    filename: string;
    imageUrl: string;
}>;
export {};
