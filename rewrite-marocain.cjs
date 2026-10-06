const fs = require('fs');

let jsx = fs.readFileSync('src/pages/themes/BorcelleTemplate.jsx', 'utf8');

// Rename classes and template names
jsx = jsx.replace(/BorcelleTemplate/g, 'MorocainTemplate');
jsx = jsx.replace(/bc-/g, 'mc-');
jsx = jsx.replace(/Borcelle/g, 'Marocain');

// Replace CSS and font imports
jsx = jsx.replace(/import '\.\/MorocainTemplate\.css';/g, "import './MorocainTemplate.css';\nimport '@fontsource/amiri';");

// Replace color tokens
jsx = jsx.replace(/branding\.mcTerra/g, "branding.bcTerra"); // wait, previous step didn't change this in raw Borcelle
jsx = jsx.replace(/branding\.bcTerra \|\| '#c2603e'/g, "branding.mcTerra || '#d4af37'");
jsx = jsx.replace(/branding\.bcInk \|\| '#2b2118'/g, "branding.mcInk || '#132e18'");
jsx = jsx.replace(/branding\.bcCream \|\| '#faf4ec'/g, "branding.mcCream || '#f5f0e6'");
jsx = jsx.replace(/branding\.bcPaper \|\| '#f3ead9'/g, "branding.mcPaper || '#ffffff'");

// Replace Hero section
const oldHero = `<section className="mc-hero">
                <div className="mc-circle mc-c1" />
                <div className="mc-circle mc-c2" />
                <div className="mc-circle mc-c3" />

                <div className="mc-hero-kicker">Carte à {new Date().getFullYear()}</div>
                <h1 className="mc-hero-title">{namePart1}{namePart2 ? <><br /><em>{namePart2}</em></> : ''}</h1>
                <p className="mc-hero-sub">{branding.tagline || 'Une cuisine d\\'inspiration, préparée chaque jour avec des produits frais.'}</p>
                <div className="mc-scroll-cue">Défiler</div>
            </section>`;

const newHero = `<section className="mc-hero">
                <div className="mc-hero-media">
                    <img src={branding.heroImage || 'https://images.unsplash.com/photo-1541363654512-5cb0ef7df590?auto=format&fit=crop&w=600&q=80'} alt="Hero" loading="lazy" />
                </div>
                <div className="mc-hero-content">
                    <div className="mc-hero-subtitle">{branding.subtitle || 'Restaurant'}</div>
                    <h1 className="mc-hero-title">{branding.name || 'Le Riad'}</h1>
                    <p className="mc-hero-desc">{branding.tagline || 'Une évasion culinaire marocaine authentique.'}</p>
                </div>
            </section>`;

jsx = jsx.replace(oldHero, newHero);

fs.writeFileSync('src/pages/themes/MorocainTemplate.jsx', jsx, 'utf8');
console.log('Done rewriting MorocainTemplate.jsx');
