import fs from 'fs';
import path from 'path';

export default async function downloadImage(validatorId: number, url: string) {
  try {
    const ext = url.split('.').pop() || '';
    const filename = `${validatorId.toString()}.${ext}`;
    const imagePath = path.join(process.cwd(), 'public', 'img', 'vals', filename);

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    if (buffer) {
      fs.writeFileSync(imagePath, Buffer.from(buffer));
    }
    return buffer ? `/img/vals/${filename}` : '';
  } catch {
    return '';
  }
}
