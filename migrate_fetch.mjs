import fs from 'fs';
import path from 'path';

function findFiles(dir, fileList) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const frontendSrcPath = path.join(process.cwd(), 'frontend', 'src');
const allFiles = findFiles(frontendSrcPath, []);

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Insert token reading if it has useSession and doesn't have token already
  if (content.includes('useSession()') && !content.includes('const token =')) {
    content = content.replace(/(const\s+tenantId\s*=\s*\(session\s*as\s*any\)?\?\.tenantId\s*\|\|\s*'';)/, "$1\n  const token = (session as any)?.accessToken || '';");
    
    // In page.tsx there might be const fetchMetrics ... wait it's easier to just replace all `fetch(` with a regex
  }

  // Replace fetch inside frontend
  // Example: headers: { 'x-tenant-id': tenantId }
  // to: headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }
  if (content.includes('fetch(\'http://localhost:4000') || content.includes('fetch(`http://localhost:4000')) {
    // We only want to transform if we have session available or it's not a public API.
    // Auth endpoints shouldn't be touched!
    if (!content.includes('auth/login') && !content.includes('auth/register') && !content.includes('/public-menu/')) {
        changed = true;
        
        // Find existing headers
        const regex = /headers:\s*\{\s*'x-tenant-id':\s*tenantId\s*\}/g;
        content = content.replace(regex, "headers: { 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }");
        
        // Sometimes it's passed with commas or other attributes
        const regex2 = /headers:\s*\{\s*'Content-Type':\s*'application\/json',\s*'x-tenant-id':\s*tenantId\s*\}/g;
        content = content.replace(regex2, "headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId, Authorization: `Bearer ${token}` }");
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated fetch in: ${filePath}`);
  }
}
