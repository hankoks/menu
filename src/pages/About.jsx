import React from 'react';

export default function About() {
    return (
        <main>
            <div className="page-container">
                <h2>À propos de nous</h2>
                <p>
                    Bienvenue au <strong>Le Jardin</strong>, où la tradition culinaire rencontre l'élégance moderne.
                    Situé au cœur de la ville, notre restaurant offre un havre de paix pour ceux qui cherchent à
                    explorer les saveurs de la Méditerranée et du Moyen-Orient.
                </p>
                <p>
                    Nos chefs passionnés utilisent uniquement les ingrédients les plus frais, sourcés localement
                    pour créer des plats qui racontent une histoire. Du murmure de nos épices à la perfection de nos cuissons,
                    chaque bouchée est une invitation au voyage.
                </p>
                <div style={{ marginTop: '30px', padding: '20px', background: 'var(--cream)', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Nos Horaires</h4>
                    <ul style={{ listStyle: 'none', lineHeight: '2' }}>
                        <li><strong>Lundi - Jeudi :</strong> 12:00 - 22:30</li>
                        <li><strong>Vendredi - Samedi :</strong> 12:00 - 23:30</li>
                        <li><strong>Dimanche :</strong> 11:00 - 22:00 (Brunch)</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
