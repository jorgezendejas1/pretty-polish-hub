import { Service, TeamMember, Testimonial, PortfolioImage, BeforeAfterImage } from '@/types';
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';

export const SERVICES: Service[] = [
  {
    id: 'mani-classic',
    name: 'Manicura Clásica',
    description: 'Manicura completa con limado, cutícula, masaje y esmaltado tradicional.',
    duration: 45,
    price: 350,
    category: 'manicura',
    imageUrl: gallery1,
  },
  {
    id: 'mani-gel',
    name: 'Manicura en Gel',
    description: 'Manicura con esmaltado semipermanente de larga duración (hasta 3 semanas).',
    duration: 60,
    price: 450,
    category: 'manicura',
    imageUrl: gallery2,
  },
  {
    id: 'pedi-spa',
    name: 'Pedicura Spa',
    description: 'Pedicura completa con exfoliación, masaje relajante y esmaltado.',
    duration: 75,
    price: 500,
    category: 'pedicura',
    imageUrl: gallery3,
  },
  {
    id: 'nail-art',
    name: 'Nail Art Personalizado',
    description: 'Diseños únicos y creativos adaptados a tu estilo personal.',
    duration: 30,
    price: 150,
    category: 'nail-art',
    imageUrl: gallery4,
    isCustomizable: true,
    customizationPrompt: '¿Cuántas uñas deseas decorar?',
    pricePerUnit: 150,
    durationPerUnit: 10,
  },
  {
    id: 'acrylic',
    name: 'Uñas Acrílicas',
    description: 'Extensión de uñas con acrílico resistente y duradero.',
    duration: 120,
    price: 800,
    category: 'esculturales',
    imageUrl: gallery1,
  },
  {
    id: 'polygel',
    name: 'Uñas con Polygel',
    description: 'Extensión ligera y flexible para un acabado natural.',
    duration: 110,
    price: 900,
    category: 'esculturales',
    imageUrl: gallery2,
  },
  {
    id: 'removal',
    name: 'Retiro de Gel/Acrílico',
    description: 'Retiro profesional y cuidadoso de esmaltado o extensiones.',
    duration: 30,
    price: 200,
    category: 'tratamientos',
    imageUrl: gallery3,
  },
  {
    id: 'paraffin',
    name: 'Tratamiento de Parafina',
    description: 'Hidratación profunda para manos suaves y rejuvenecidas.',
    duration: 30,
    price: 250,
    category: 'tratamientos',
    imageUrl: gallery4,
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'lily',
    name: 'Lily',
    role: 'Nail Artist Principal',
    specialty: 'Especialista en Nail Art y Diseños 3D',
    imageUrl: gallery1,
    unavailableDays: [0], // Sunday
  },
  {
    id: 'sofia',
    name: 'Sofía',
    role: 'Técnica en Uñas',
    specialty: 'Experta en Uñas Esculturales',
    imageUrl: gallery2,
    unavailableDays: [0, 6], // Sunday and Saturday
  },
  {
    id: 'ana',
    name: 'Ana',
    role: 'Manicurista',
    specialty: 'Manicura y Pedicura Spa',
    imageUrl: gallery3,
    unavailableDays: [0], // Sunday
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'El mejor salón de uñas en Cancún. Lily es una verdadera artista, siempre supera mis expectativas.',
    author: 'María González',
  },
  {
    quote: 'Ambiente acogedor y profesional. Mis uñas nunca habían lucido tan hermosas y duraderas.',
    author: 'Carmen Ruiz',
  },
  {
    quote: 'La atención al detalle es increíble. Cada visita es una experiencia relajante y lujosa.',
    author: 'Isabella Torres',
  },
];

export const PORTFOLIO_IMAGES: PortfolioImage[] = [
  {
    id: 'port-1',
    src: gallery1,
    alt: 'Diseño de uñas con flores',
    category: 'nail-art',
  },
  {
    id: 'port-2',
    src: gallery2,
    alt: 'Manicura francesa elegante',
    category: 'manicura',
  },
  {
    id: 'port-3',
    src: gallery3,
    alt: 'Uñas acrílicas con efecto mármol',
    category: 'esculturales',
  },
  {
    id: 'port-4',
    src: gallery4,
    alt: 'Diseño geométrico moderno',
    category: 'nail-art',
  },
  {
    id: 'port-5',
    src: gallery1,
    alt: 'Pedicura con acabado brillante',
    category: 'pedicura',
  },
  {
    id: 'port-6',
    src: gallery2,
    alt: 'Uñas con glitter y cristales',
    category: 'nail-art',
  },
  {
    id: 'port-7',
    src: gallery3,
    alt: 'Manicura nude natural',
    category: 'manicura',
  },
  {
    id: 'port-8',
    src: gallery4,
    alt: 'Extensión con polygel',
    category: 'esculturales',
  },
];

export const BEFORE_AFTER_IMAGES: BeforeAfterImage[] = [
  {
    id: 'ba-1',
    title: 'Transformación Completa',
    description: 'De uñas dañadas a un look completamente renovado con acrílico.',
    beforeSrc: gallery1,
    afterSrc: gallery2,
  },
  {
    id: 'ba-2',
    title: 'Nail Art Impresionante',
    description: 'De un esmaltado simple a un diseño artístico personalizado.',
    beforeSrc: gallery3,
    afterSrc: gallery4,
  },
  {
    id: 'ba-3',
    title: 'Restauración de Salud',
    description: 'Recuperación de uñas debilitadas con tratamiento especializado.',
    beforeSrc: gallery2,
    afterSrc: gallery1,
  },
];

export const SALON_INFO = {
  name: 'Pitaya Nails',
  address: 'Jardines del Sur 5, Cancún, Quintana Roo, C.P. 77536',
  phone: '+52 998 112 3411',
  email: 'info@pitayanails.com',
  hours: {
    weekdays: 'Lun - Sab: 10:00 AM - 8:00 PM',
    saturday: 'Lun - Sab: 10:00 AM - 8:00 PM',
    sunday: 'Domingo: Cerrado',
  },
  coordinates: {
    lat: 21.086719,
    lng: -86.876999,
  },
  social: {
    instagram: 'https://instagram.com/nailstation_cun',
    facebook: 'https://www.facebook.com/share/17VY8FsYCU/?mibextid=wwXIfr',
    whatsapp: 'https://wa.me/5219981123411',
  },
};

export const ABOUT_TEXT = `
Pitaya Nails es más que un salón de uñas, es un refugio de belleza y bienestar en el corazón de Cancún. 
Fundado en 2020 por Lily Rodríguez, nuestro studio se ha convertido en el destino preferido para quienes 
buscan excelencia en el cuidado de sus uñas.

Nos enorgullecemos de ofrecer servicios de la más alta calidad utilizando productos premium y técnicas 
innovadoras. Nuestro equipo de profesionales altamente capacitadas está comprometido con la salud de tus 
uñas y tu satisfacción total.

En Pitaya Nails, cada cliente es único y merece una atención personalizada. Nos tomamos el tiempo para 
entender tus deseos y crear looks que reflejen tu personalidad y estilo.
`;

export const DIPLOMAS = [
  {
    id: 'cert-1',
    title: 'Certificación Internacional en Nail Art',
    issuer: 'International Beauty Academy',
    year: 2019,
    imageUrl: gallery1,
  },
  {
    id: 'cert-2',
    title: 'Especialización en Uñas Esculturales',
    issuer: 'Mexican Nail Institute',
    year: 2020,
    imageUrl: gallery2,
  },
  {
    id: 'cert-3',
    title: 'Maestría en Técnicas Avanzadas de Manicura',
    issuer: 'Professional Nails School',
    year: 2021,
    imageUrl: gallery3,
  },
];
