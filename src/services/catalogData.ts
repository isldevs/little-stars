import type { Category, Color, Product } from '../lib/types';

interface ProductSeed {
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  description: string;
  materials: string;
  care: string;
  colors: Color[];
  collection: string;
  tags: string[];
}

const ivory = { name: 'Ivory', hex: '#E7E2D6' };
const sage = { name: 'Sage', hex: '#A5AD94' };
const charcoal = { name: 'Charcoal', hex: '#454744' };
const oat = { name: 'Oat', hex: '#C8B89F' };
const navy = { name: 'Navy', hex: '#354052' };
const blue = { name: 'Blue', hex: '#819AA9' };
const rose = { name: 'Rose', hex: '#CAAAA4' };
const terracotta = { name: 'Terracotta', hex: '#B9785E' };
const cottonCare = 'Machine wash cold with similar colors. Reshape while damp and line dry. Cool iron if needed.';
const linenCare = 'Gentle machine wash cold. Line dry in the shade. Warm iron while slightly damp, or embrace the natural texture.';
const knitCare = 'Hand wash cold with a gentle detergent. Reshape and dry flat. Store folded to preserve the fit.';

const seeds: ProductSeed[] = [
  {
    name: 'The Everyday Linen Shirt', category: 'women', price: 6800,
    description: 'The shirt you will reach for long after summer. Airy, garment-washed linen meets a softly oversized shape, dropped shoulders, and a curved hem that looks just as good tucked in as it does loose.',
    materials: '100% European flax linen. Garment washed for a softer hand feel.', care: linenCare,
    colors: [ivory, sage], collection: 'everyday-essentials', tags: ['linen', 'shirt', 'breathable', 'new arrivals', 'bestseller'],
  },
  {
    name: 'Relaxed Cotton T-Shirt', category: 'women', price: 3200,
    description: 'An exceptionally soft everyday tee with a neat ribbed neckline and an easy, relaxed fit. Substantial enough to wear on its own, light enough to layer through the seasons.',
    materials: '100% organic cotton jersey, 180 gsm.', care: cottonCare,
    colors: [ivory, charcoal], collection: 'everyday-essentials', tags: ['cotton', 't-shirt', 'tee', 'basics', 'bestseller'],
  },
  {
    name: 'The Weekend Knit', category: 'women', price: 8900,
    description: 'A wonderfully soft layer for slow mornings and evenings out. This relaxed open-knit layer has a gently draped shape and a softly textured finish.',
    materials: '60% organic cotton, 30% recycled nylon, 10% wool.', care: knitCare,
    colors: [oat, sage], collection: 'slow-days', tags: ['knitwear', 'cardigan', 'layering', 'new arrivals'],
  },
  {
    name: 'Wide-Leg Linen Trousers', category: 'women', price: 7800,
    description: 'Made for movement, made for everyday. These fluid linen trousers sit comfortably at the waist with a gentle elasticated back, discreet side pockets, and a beautifully easy wide leg.',
    materials: '100% European flax linen. Undyed cotton pocket lining.', care: linenCare,
    colors: [oat, charcoal], collection: 'everyday-essentials', tags: ['linen', 'trousers', 'pants', 'wide-leg', 'bestseller'],
  },
  {
    name: 'Soft Rib Tank', category: 'women', price: 2800, originalPrice: 3800,
    description: 'A close-fitting ribbed tank with a flattering scoop neckline and a little natural stretch. Wear it with linen trousers on warm days or beneath your favorite shirt when the air turns cool.',
    materials: '95% organic cotton, 5% elastane.', care: cottonCare,
    colors: [ivory, rose], collection: 'everyday-essentials', tags: ['tank', 'cotton', 'rib', 'basics', 'sale'],
  },
  {
    name: 'Gathered Cotton Midi Dress', category: 'women', price: 9800,
    description: 'Easy elegance in crisp cotton poplin. A gently gathered waist, practical pockets, and a softly sweeping midi skirt give this dress an effortless shape from weekday plans to weekend escapes.',
    materials: '100% organic cotton poplin. Fully lined in lightweight cotton.', care: cottonCare,
    colors: [sage, charcoal], collection: 'natural-living', tags: ['dress', 'midi', 'cotton', 'new arrivals'],
  },
  {
    name: 'The Everyday Straight Jean', category: 'women', price: 8800,
    description: 'Your favorite familiar denim, from the very first wear. A mid-rise waist and a straight leg create an easy silhouette, finished with classic five-pocket styling and a softly washed blue.',
    materials: '99% cotton, 1% elastane. Made with 20% recycled cotton.', care: 'Wash inside out in cold water with similar colors. Line dry. Wash less often to preserve the finish.',
    colors: [blue, ivory], collection: 'everyday-essentials', tags: ['denim', 'jeans', 'straight-leg', 'bestseller'],
  },
  {
    name: 'Textured Cotton Blouse', category: 'women', price: 5400, originalPrice: 7200,
    description: 'A little texture, a little everyday romance. This airy cotton blouse has a soft square neckline, gently gathered sleeves, and an easy shape that pairs beautifully with denim or linen.',
    materials: '100% cotton dobby with a woven dot texture.', care: cottonCare,
    colors: [ivory, terracotta], collection: 'natural-living', tags: ['blouse', 'cotton', 'texture', 'sale'],
  },
  {
    name: 'Linen Camp-Collar Shirt', category: 'men', price: 7200,
    description: 'A relaxed take on a warm-weather favorite. Breathable washed linen, a clean camp collar, and an easy straight hem make this short-sleeve shirt an effortless choice for days off.',
    materials: '100% European flax linen. Garment washed.', care: linenCare,
    colors: [sage, ivory], collection: 'natural-living', tags: ['linen', 'shirt', 'short-sleeve', 'new arrivals'],
  },
  {
    name: 'Essential Organic Cotton Tee', category: 'men', price: 3400,
    description: 'A wardrobe cornerstone, thoughtfully refined. Soft, durable organic cotton jersey gives this classic crewneck tee an easy feel, while a gently structured fit keeps it looking considered.',
    materials: '100% organic cotton jersey, 200 gsm.', care: cottonCare,
    colors: [charcoal, ivory], collection: 'everyday-essentials', tags: ['cotton', 't-shirt', 'tee', 'basics', 'bestseller'],
  },
  {
    name: 'Relaxed Chino Trousers', category: 'men', price: 8200,
    description: 'A comfortable pair for just about anywhere. Soft cotton twill, an easy straight leg, and a clean waistband make these chinos a dependable choice from the office to the weekend.',
    materials: '98% organic cotton, 2% elastane. Brushed cotton twill.', care: cottonCare,
    colors: [oat, navy], collection: 'everyday-essentials', tags: ['chinos', 'trousers', 'pants', 'bestseller'],
  },
  {
    name: 'Premium Cotton Crewneck Tee', category: 'men', price: 6400,
    description: 'A familiar tee, made a little more considered. This breathable premium cotton jersey has a neat crew neckline and an easy shape for days that feel relaxed.',
    materials: '100% organic cotton premium jersey.', care: knitCare,
    colors: [ivory, navy], collection: 'slow-days', tags: ['polo', 'knitwear', 'cotton', 'new arrivals'],
  },
  {
    name: 'The Everyday Overshirt', category: 'men', price: 9600,
    description: 'That just-right layer between a shirt and a jacket. Our substantial brushed cotton overshirt has a relaxed shape, roomy patch pockets, and enough space for your favorite tee underneath.',
    materials: '100% cotton brushed twill. Made with 30% recycled cotton.', care: cottonCare,
    colors: [sage, charcoal], collection: 'everyday-essentials', tags: ['overshirt', 'jacket', 'cotton', 'layering'],
  },
  {
    name: 'Drawstring Linen Shorts', category: 'men', price: 4800, originalPrice: 6400,
    description: 'A lighter way to spend the weekend. These relaxed linen shorts have an elasticated drawstring waist, practical side pockets, and a comfortable above-the-knee length.',
    materials: '55% linen, 45% organic cotton.', care: linenCare,
    colors: [oat, navy], collection: 'natural-living', tags: ['linen', 'shorts', 'drawstring', 'sale'],
  },
  {
    name: 'Soft Cotton Crewneck', category: 'men', price: 7600,
    description: 'A simple sweater, made to feel special. Soft cotton yarn, a comfortable crew neckline, and tidy ribbed edges create an easy layer you can wear all year.',
    materials: '100% organic cotton in a medium-gauge knit.', care: knitCare,
    colors: [blue, oat], collection: 'slow-days', tags: ['sweater', 'knitwear', 'crewneck', 'new arrivals'],
  },
  {
    name: 'Washed Denim Shirt', category: 'men', price: 8400,
    description: 'Familiar denim in a softer, lighter form. This easy button-down shirt features a gently washed finish, a single chest pocket, and a comfortable fit that works open over a tee or on its own.',
    materials: '100% cotton lightweight denim. Made with 20% recycled cotton.', care: 'Machine wash cold inside out with similar colors. Line dry. Warm iron if needed.',
    colors: [blue, charcoal], collection: 'everyday-essentials', tags: ['denim', 'shirt', 'button-down', 'layering'],
  },
  {
    name: 'Little Explorer Cotton Tee', category: 'kids', price: 2200,
    description: 'Made for big adventures and everyday discoveries. A soft organic cotton tee with a comfortable crew neck, an easy fit, and a tiny embroidered star at the hem.',
    materials: '100% organic cotton jersey. Soft printed neck label.', care: cottonCare,
    colors: [ivory, sage], collection: 'little-adventures', tags: ['cotton', 't-shirt', 'tee', 'new arrivals', 'bestseller'],
  },
  {
    name: 'Play-All-Day Dungarees', category: 'kids', price: 4800,
    description: 'Room to grow, play, and make a little mess. These soft cotton dungarees have adjustable shoulder straps, roomy pockets, and an easy shape designed for small adventurers.',
    materials: '100% cotton canvas. Nickel-free metal fasteners.', care: cottonCare,
    colors: [oat, blue], collection: 'little-adventures', tags: ['dungarees', 'overalls', 'cotton', 'bestseller'],
  },
  {
    name: 'Cozy Cotton Cardigan', category: 'kids', price: 4200,
    description: 'A soft little layer for breezy mornings and cozy afternoons. This cotton cardigan has an easy button front, gently ribbed cuffs, and a fit with room for growing.',
    materials: '100% organic cotton in a soft garter knit.', care: knitCare,
    colors: [sage, rose], collection: 'slow-days', tags: ['cardigan', 'knitwear', 'cotton', 'new arrivals'],
  },
  {
    name: 'Easy Cotton Shorts', category: 'kids', price: 2800, originalPrice: 3600,
    description: 'For running, jumping, and getting wonderfully comfortable. Soft cotton, a gentle waistband, and a comfortable above-the-knee length make these shorts an everyday favorite.',
    materials: '95% organic cotton, 5% elastane. Brushed loopback interior.', care: cottonCare,
    colors: [charcoal, oat], collection: 'little-adventures', tags: ['joggers', 'trousers', 'pants', 'cotton', 'sale'],
  },
  {
    name: 'Little Meadow Dress', category: 'kids', price: 4600,
    description: 'A twirl-ready dress for everyday magic. Airy cotton, a gently gathered skirt, and comfortable short sleeves keep little ones feeling as lovely as they look.',
    materials: '100% organic cotton poplin. Soft cotton lining.', care: cottonCare,
    colors: [rose, sage], collection: 'little-adventures', tags: ['dress', 'cotton', 'new arrivals'],
  },
  {
    name: 'Mini Stripe Long-Sleeve Tee', category: 'kids', price: 2600,
    description: 'A cheerful little classic with everyday staying power. Yarn-dyed stripes, soft cotton, and an easy neckline make this long-sleeve tee a dependable layer for cooler days.',
    materials: '100% organic cotton yarn-dyed jersey.', care: cottonCare,
    colors: [navy, terracotta], collection: 'everyday-essentials', tags: ['stripes', 'cotton', 't-shirt', 'long-sleeve', 'bestseller'],
  },
  {
    name: 'Adventure Linen Shorts', category: 'kids', price: 2400, originalPrice: 3200,
    description: 'Light, comfy shorts for sun-filled days. A soft linen-cotton blend, pull-on waist, and generous pockets keep small explorers comfortable wherever the afternoon leads.',
    materials: '55% linen, 45% organic cotton. Soft elastic waistband.', care: linenCare,
    colors: [oat, sage], collection: 'little-adventures', tags: ['shorts', 'linen', 'cotton', 'sale'],
  },
  {
    name: 'Little Stars Quilted Vest', category: 'kids', price: 5200,
    description: 'A warm hug for the in-between seasons. Lightly quilted cotton, an easy snap front, and cozy pockets make this vest a useful layer over a tee or favorite sweater.',
    materials: '100% cotton outer and lining. 100% recycled polyester lightweight fill.', care: 'Machine wash cold on a gentle cycle. Close snaps before washing. Line dry and do not iron the quilting.',
    colors: [sage, terracotta], collection: 'little-adventures', tags: ['vest', 'gilet', 'outerwear', 'quilted'],
  },
];

export const products: Product[] = seeds.map((seed, index) => {
  const id = `p${index + 1}`;
  const sizes = seed.category === 'kids' ? ['2–3Y', '4–5Y', '6–7Y', '8–9Y'] : ['XS', 'S', 'M', 'L', 'XL'];
  return {
    ...seed,
    id,
    slug: seed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    images: [`/images/product-${index + 1}.jpg`, `/images/product-${index + 1}-detail.jpg`],
    sizes,
    variants: seed.colors.flatMap((color, colorIndex) => sizes.map((size, sizeIndex) => ({
      id: `${id}-${color.name.toLowerCase().replace(/\s+/g, '-')}-${size}`,
      color: color.name,
      size,
      stock: index === 23 || (sizeIndex === sizes.length - 1 && colorIndex === 1) ? 0 : 2 + ((index * 3 + sizeIndex * 2 + colorIndex) % 12),
    }))),
    featured: [0, 1, 2, 3, 5, 8, 10, 16, 17, 21].includes(index),
    createdAt: `2026-10-${String(30 - index).padStart(2, '0')}T10:00:00.000Z`,
  };
});
