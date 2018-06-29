import fs from 'fs-extra';

export async function listDirectory(path, re = /\.js/) {
  const contents = await fs.readdir(path);
  return contents.filter(v => re.test(v));
}
