import fs from 'fs';
const path = 'dist';
if (fs.existsSync(path)) {
  fs.rmSync(path, { recursive: true, force: true });
  console.log('Deleted dist folder');
} else {
  console.log('No dist folder to delete');
}
