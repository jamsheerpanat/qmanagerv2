import fs from 'fs';

function fixFile(filePath, messages) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');

  // Sort messages in reverse line order to prevent shifting issues
  messages.sort((a, b) => b.line - a.line || b.column - a.column);

  for (const msg of messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      const match = msg.message.match(/'([^']+)' is/);
      if (match) {
        const varName = match[1];
        let line = lines[msg.line - 1];
        
        // Remove from import { ... }
        if (line.includes('import')) {
          line = line.replace(new RegExp(`\\b${varName}\\b\\s*,?\\s*`), '');
          line = line.replace(/,\s*}/, '}').replace(/{\s*,/, '{');
          if (line.match(/import\s*{\s*}\s*from/)) {
            lines[msg.line - 1] = '';
          } else {
            lines[msg.line - 1] = line;
          }
        } 
        // Remove from function signature arguments
        else if (line.includes(varName) && (line.includes('(') || line.includes('function') || line.includes('=>'))) {
          line = line.replace(new RegExp(`\\b${varName}\\b\\s*:\\s*[^,)]+(,\\s*)?`), '');
          line = line.replace(new RegExp(`,\\s*\\b${varName}\\b\\s*:\\s*[^,)]+`), '');
          line = line.replace(new RegExp(`\\b${varName}\\b\\s*(,\\s*)?`), '');
          lines[msg.line - 1] = line;
        }
        // Remove unused destructuring
        else if (line.includes(varName) && (line.includes('{') || line.includes('['))) {
           line = line.replace(new RegExp(`\\b${varName}\\b\\s*(:\\s*[^,}]+)?\\s*,?\\s*`), '');
           line = line.replace(/,\s*}/, '}').replace(/{\s*,/, '{');
           lines[msg.line - 1] = line;
        }
      }
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'));
}

['apps/frontend/lint-results.json', 'apps/backend/lint-results.json'].forEach(file => {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const result of data) {
      if (result.messages.length > 0) {
        fixFile(result.filePath, result.messages);
      }
    }
  }
});
