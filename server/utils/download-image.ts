import fs from 'fs';
import path from 'path';

export default async function downloadImage(logoType: string, id: number | string, url: string) {
  try {
    const ext = url.split('.').pop() || '';
    const filename = `${id.toString()}.${ext}`;
    const imagePath = path.join(process.cwd(), 'public', 'img', logoType);

    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath, { recursive: true });
    }

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    if (buffer) {
      fs.writeFileSync(imagePath + `/${filename}`, Buffer.from(buffer));
    }
    return buffer ? `/img/${logoType}/${filename}` : '';
  } catch {
    return '';
  }
}
