import { readFile } from 'fs/promises';
import mime from 'mime';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function GET(_: NextRequest, ctx: any) {
  try {
    const path = (ctx.params.path as string[]).join('/');
    if (path.indexOf('..') !== -1) {
      return NextResponse.json({ success: false, error: 'Error in path' }, { status: 400 });
    }

    const filename = join(process.cwd(), `/uploads`, path);
    const fileType = mime.getType(filename) as string;
    const file = await readFile(filename);

    const headers = new Headers();
    headers.set('Content-Type', fileType);
    return new NextResponse(file, { status: 200, statusText: 'OK', headers });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as any).message }, { status: 500 });
  }
}
