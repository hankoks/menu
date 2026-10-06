const fs = require('fs');
const files = [
    'src/pages/themes/MorocainTemplate.jsx',
    'src/pages/admin/AdminSettings.jsx',
    'src/pages/themes/MorocainTemplate.css'
];
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Strip BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`BOM stripped from ${file}`);
    } else {
        console.log(`No BOM found in ${file}`);
    }
});
