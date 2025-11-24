import { Service, TeamMember, Testimonial, PortfolioImage, BeforeAfterImage } from '@/types';
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import port001 from '@/assets/portfolio/port-001.jpg';
import port002 from '@/assets/portfolio/port-002.jpg';
import port003 from '@/assets/portfolio/port-003.jpg';
import port004 from '@/assets/portfolio/port-004.jpg';
import port005 from '@/assets/portfolio/port-005.jpg';
import port006 from '@/assets/portfolio/port-006.jpg';
import port007 from '@/assets/portfolio/port-007.jpg';
import port008 from '@/assets/portfolio/port-008.jpg';
import port009 from '@/assets/portfolio/port-009.jpg';
import port010 from '@/assets/portfolio/port-010.jpg';
import port011 from '@/assets/portfolio/port-011.jpg';
import port012 from '@/assets/portfolio/port-012.jpg';
import port013 from '@/assets/portfolio/port-013.jpg';
import port014 from '@/assets/portfolio/port-014.jpg';
import port015 from '@/assets/portfolio/port-015.jpg';
import port016 from '@/assets/portfolio/port-016.jpg';
import port017 from '@/assets/portfolio/port-017.jpg';
import port018 from '@/assets/portfolio/port-018.jpg';
import port019 from '@/assets/portfolio/port-019.jpg';
import port020 from '@/assets/portfolio/port-020.jpg';
import port021 from '@/assets/portfolio/port-021.jpg';
import port022 from '@/assets/portfolio/port-022.jpg';
import port023 from '@/assets/portfolio/port-023.jpg';
import port024 from '@/assets/portfolio/port-024.jpg';
import port025 from '@/assets/portfolio/port-025.jpg';
import port026 from '@/assets/portfolio/port-026.jpg';
import port027 from '@/assets/portfolio/port-027.jpg';
import port028 from '@/assets/portfolio/port-028.jpg';
import port029 from '@/assets/portfolio/port-029.jpg';
import port030 from '@/assets/portfolio/port-030.jpg';
import port031 from '@/assets/portfolio/port-031.jpg';

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
    name: 'Lily Montaño',
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
    id: 'port-001',
    src: port001,
    alt: 'Diseño de uñas elegante',
    category: 'nail-art',
  },
  {
    id: 'port-002',
    src: port002,
    alt: 'Manicura profesional',
    category: 'manicura',
  },
  {
    id: 'port-003',
    src: port003,
    alt: 'Uñas acrílicas perfectas',
    category: 'esculturales',
  },
  {
    id: 'port-004',
    src: port004,
    alt: 'Diseño creativo',
    category: 'nail-art',
  },
  {
    id: 'port-005',
    src: port005,
    alt: 'Acabado brillante',
    category: 'manicura',
  },
  {
    id: 'port-006',
    src: port006,
    alt: 'Uñas con decoración',
    category: 'nail-art',
  },
  {
    id: 'port-007',
    src: port007,
    alt: 'Manicura nude',
    category: 'manicura',
  },
  {
    id: 'port-008',
    src: port008,
    alt: 'Extensión profesional',
    category: 'esculturales',
  },
  {
    id: 'port-009',
    src: port009,
    alt: 'Diseño artístico',
    category: 'nail-art',
  },
  {
    id: 'port-010',
    src: port010,
    alt: 'Trabajo detallado',
    category: 'nail-art',
  },
  {
    id: 'port-011',
    src: port011,
    alt: 'Manicura elegante',
    category: 'manicura',
  },
  {
    id: 'port-012',
    src: port012,
    alt: 'Diseño personalizado',
    category: 'nail-art',
  },
  {
    id: 'port-013',
    src: port013,
    alt: 'Uñas con mariposa holográfica y glitter',
    category: 'nail-art',
  },
  {
    id: 'port-014',
    src: port014,
    alt: 'Diseño con mariposa iridiscente',
    category: 'nail-art',
  },
  {
    id: 'port-015',
    src: port015,
    alt: 'French tips con decoración de cristales',
    category: 'nail-art',
  },
  {
    id: 'port-016',
    src: port016,
    alt: 'Manicura francesa con glitter naranja',
    category: 'nail-art',
  },
  {
    id: 'port-017',
    src: port017,
    alt: 'Diseño con detalles dorados y glitter',
    category: 'nail-art',
  },
  {
    id: 'port-018',
    src: port018,
    alt: 'Manicura natural con french tips',
    category: 'manicura',
  },
  {
    id: 'port-019',
    src: port019,
    alt: 'Uñas con glitter plateado en degradado',
    category: 'manicura',
  },
  {
    id: 'port-025',
    src: port025,
    alt: 'Pedicura con glitter dorado en pies',
    category: 'pedicura',
  },
  {
    id: 'port-026',
    src: port026,
    alt: 'Uñas rojas con diseño floral y glitter dorado',
    category: 'nail-art',
  },
  {
    id: 'port-027',
    src: port027,
    alt: 'Diseño navideño con Santa Claus',
    category: 'nail-art',
  },
  {
    id: 'port-029',
    src: port029,
    alt: 'French tips con diseño floral colorido',
    category: 'nail-art',
  },
  {
    id: 'port-030',
    src: port030,
    alt: 'Pedicura con diseño animal print',
    category: 'pedicura',
  },
  {
    id: 'port-031',
    src: port031,
    alt: 'Diseño tropical colorido con hojas y flores',
    category: 'nail-art',
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
  phone: '+52 998 590 0050',
  email: 'pitayanailscancun@gmail.com',
  hours: {
    weekdays: 'Lunes a Sábado: 10:00 AM - 7:00 PM',
    saturday: 'Lunes a Sábado: 10:00 AM - 7:00 PM',
    sunday: 'Domingo: Cerrado',
  },
  coordinates: {
    lat: 21.1471847,
    lng: -86.8271523,
  },
  social: {
    instagram: 'https://www.instagram.com/nailstation_cun',
    facebook: 'https://www.facebook.com/profile.php?id=61569280002188',
    whatsapp: 'https://wa.me/5219985900050?text=Vengo%20de%20PitayaNails.com%2C%20quiero%20mas%20informacion',
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
