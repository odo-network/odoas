import FS from 'fs';

const fs = FS.promises;

export async function listDirectory(path, re = /\.js/) {
  const contents = await fs.readdir(path);
  return contents.filter(v => re.test(v));
}
