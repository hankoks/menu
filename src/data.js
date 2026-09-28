export const menuData = [
    {
        id: 1001,
        category: 'Entrées',
        name: 'Salade César Royale',
        desc: 'Laitue romaine croquante, poulet grillé au feu de bois, croûtons à l\'ail, copeaux de parmesan affiné et notre sauce César secrète.',
        price: 65,
        images: ['https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=1200&q=80'],
        icon: '🥗',
        colors: ['#a8e063', '#56ab2f'],
        badge: null
    },
    {
        id: 1002,
        category: 'Entrées',
        name: 'Soupe à l\'Oignon Gratinée',
        desc: 'Soupe traditionnelle française, oignons caramélisés et croûton garni de gruyère fondu. Parfaite pour se réchauffer.',
        price: 45,
        images: ['https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80'],
        icon: '🥣',
        colors: ['#e2a846', '#c9822a'],
        badge: { type: 'red', text: 'Nouveau' }
    },
    {
        id: 1003,
        category: 'Plats',
        name: 'Penne Arrabbiata & Burrata',
        desc: 'Pâtes fraîches al dente servies dans une sauce tomate épicée, surmontées d\'une véritable burrata crémeuse et de basilic.',
        price: 85,
        images: [
            'https://images.unsplash.com/photo-1621996316521-0a63aaab4e17?w=1200&q=80',
            'https://images.unsplash.com/photo-1563379926898-05f4e5ee8e9b?w=1200&q=80'
        ],
        icon: '🍝',
        colors: ['#ff9966', '#ff5e62'],
        badge: { type: 'green', text: 'Végétarien' }
    },
    {
        id: 1004,
        category: 'Plats',
        name: 'Filet de Bœuf sauce Poivre',
        desc: 'Cœur de filet tendre cuit à votre goût, nappé de notre sauce onctueuse au poivre vert de Madagascar, accompagné de frites maison.',
        price: 145,
        images: [
            'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
            'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=80'
        ],
        icon: '🥩',
        colors: ['#434343', '#000000'],
        badge: { type: 'red', text: 'Signature' }
    },
    {
        id: 1005,
        category: 'Fast Food',
        name: 'Burger Truffe & Angus',
        desc: 'Steak haché de bœuf Angus 200g, cheddar maturé, roquette, oignons caramélisés et mayonnaise infusée à la truffe noire.',
        price: 95,
        icon: '🍔',
        images: [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
            'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80',
            'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=1200&q=80'
        ],
        colors: ['#f4d03f', '#16a085'],
        hasVariants: true,
        variants: [
            { name: 'Simple (1 Steak)', price: 95, isAvailable: true },
            { name: 'Double (2 Steaks)', price: 130, isAvailable: true }
        ],
        extras: [
            { name: 'Bacon croustillant', price: 15, isAvailable: true },
            { name: 'Oignons rings', price: 12, isAvailable: true },
            { name: 'Supplément Truffe', price: 20, isAvailable: true }
        ],
        badge: { type: 'red', text: 'Best Seller' }
    },
    {
        id: 1006,
        category: 'Fast Food',
        name: 'Tacos Supreme Poulet',
        desc: 'Le classique revisité : poulet mariné croustillant, sauce fromagère gruyère, frites maison dorées et tomates fraîches.',
        price: 60,
        icon: '🌮',
        images: [
            'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=1200&q=80',
            'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=1200&q=80'
        ],
        colors: ['#e2a846', '#c9822a'],
        hasVariants: true,
        variants: [
            { name: 'Taille M', price: 60, isAvailable: true },
            { name: 'Taille L', price: 75, isAvailable: true }
        ],
        extras: [
            { name: 'Viande hachée', price: 15, isAvailable: true },
            { name: 'Fromage gratiné', price: 10, isAvailable: true }
        ]
    },
    {
        id: 1007,
        category: 'Tajines',
        name: 'Tajine d\'Agneau Mrouzia',
        desc: 'Agneau rôti doucement, pruneaux caramélisés au miel et aux épices douces, parsemé d\'amandes dorées.',
        price: 120,
        images: ['https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=1200&q=80'],
        icon: '🍲',
        colors: ['#9d5b15', '#603813'],
        badge: null
    },
    {
        id: 1008,
        category: 'Grillades',
        name: 'Poulet Rôti aux Herbes',
        desc: 'Demi-poulet fermier rôti lentement à la broche au romarin et thym. Servi avec des pommes grenailles sautées.',
        price: 75,
        images: ['https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=1200&q=80'],
        icon: '🍗',
        colors: ['#f2994a', '#f2c94c'],
        badge: null
    },
    {
        id: 1009,
        category: 'Desserts',
        name: 'Tiramisu au Café',
        desc: 'Véritable recette italienne au mascarpone frais, biscuit à la cuillère intensément imbibé de café expresso.',
        price: 45,
        images: ['https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=1200&q=80'],
        icon: '🍰',
        colors: ['#c9a86a', '#b08f52'],
        badge: null
    },
    {
        id: 1010,
        category: 'Boissons',
        name: 'Smoothie Framboise Menthe',
        desc: 'Mélange énergisant de framboises, fraises, myrtilles et pointe de menthe fraîche pilée.',
        price: 35,
        images: ['https://images.unsplash.com/photo-1577805947697-89e18249d767?w=1200&q=80'],
        icon: '🍹',
        colors: ['#ff4b2b', '#ff416c'],
        badge: null
    }
];

export const categories = [
    { name: 'Entrées', icon: '🥗' },
    { name: 'Plats', icon: '🍝' },
    { name: 'Fast Food', icon: '🍔' },
    { name: 'Tajines', icon: '🍲' },
    { name: 'Grillades', icon: '🍖' },
    { name: 'Desserts', icon: '🍰' },
    { name: 'Boissons', icon: '🍹' }
];
