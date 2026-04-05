const fs = require('fs');
const path = require('path');

const dir = 'c:/xampp/htdocs/AppDevFInal/frontend/src/components/landing';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (file === 'Hero.tsx') {
    content = content.replace(/animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}/g, 'whileInView={{ opacity: 1, y: 0 }}\n                    viewport={{ once: false, amount: 0.1 }}');
  } else {
    content = content.replace(/viewport=\{\{\s*once:\s*true\s*\}\}/g, 'viewport={{ once: false, amount: 0.2 }}');
  }
  
  fs.writeFileSync(filePath, content);
}
console.log('Animations updated.');
