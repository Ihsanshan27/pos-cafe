import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export const imageDir = join(process.cwd(), 'img');

if (!existsSync(imageDir)) {
  mkdirSync(imageDir, { recursive: true });
}

type SaveOptimizedImageOptions = {
  buffer: Buffer;
  prefix: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

export async function saveOptimizedImage({
  buffer,
  prefix,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 80,
}: SaveOptimizedImageOptions) {
  if (!buffer || buffer.length === 0) {
    throw new BadRequestException('Image buffer is empty');
  }

  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const outputPath = join(imageDir, filename);

  const optimized = await sharp(buffer)
    .rotate()
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 4,
    })
    .toBuffer();

  await writeFile(outputPath, optimized);

  return {
    filename,
    imageUrl: `/img/${filename}`,
  };
}
