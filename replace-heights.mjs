import fs from 'fs/promises';
import path from 'path';

async function processDirectory(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const content = await fs.readFile(fullPath, 'utf8');
      if (content.includes('height: "297mm"')) {
        const newContent = content.replace(/height:\s*"297mm"/g, 'height: "100%"');
        await fs.writeFile(fullPath, newContent);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory('./packages/pdf-templates/src').catch(console.error);
