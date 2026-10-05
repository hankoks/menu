import https from 'https';

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (r) => {
            let d = '';
            r.on('data', c => d += c);
            r.on('end', () => resolve(d));
            r.on('error', reject);
        });
    });
}

const html = await get('https://mauve.vercel.app/');
const cssMatch = html.match(/href="(\/assets\/index-[^"]+\.css)"/);
if (!cssMatch) { console.log('Could not find CSS URL in HTML'); process.exit(1); }

const cssUrl = 'https://mauve.vercel.app' + cssMatch[1];
console.log('Live CSS URL:', cssUrl);

const css = await get(cssUrl);

// Check bc-items occurrences
const bcItems = css.match(/.{0,30}\.bc-items.{0,200}/g) || [];
console.log('\n--- .bc-items rules ---');
bcItems.forEach(m => console.log(m));

// Check the grid-template-columns near bc-items
console.log('\n--- grid-template-columns near bc- ---');
const gtc = css.match(/.{0,20}bc-.{0,100}1fr.{0,50}/g) || [];
gtc.forEach(m => console.log(m));
