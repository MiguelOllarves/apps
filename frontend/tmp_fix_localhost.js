
const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (f === 'node_modules' || f === '.next' || f === '.git') return;
    isDirectory ?
      walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const frontendDir = 'e:/PROYECTOS/app-administrativo-comida/nexus-gastro/apps/frontend/src';

walk(frontendDir, (file) => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('localhost:4000')) {
            console.log(`Fixing ${file}`);
            const newContent = content.replace(/localhost:4000/g, '127.0.0.1:4000');
            fs.writeFileSync(file, newContent);
        }
    }
});
