import { SERVICES } from './constants';

export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'Pitaya Nails',
  description: 'Studio de uñas profesional especializado en manicura, pedicura y diseños exclusivos en Cancún.',
  image: 'https://lovable.dev/opengraph-image-p98pqg.png',
  '@id': 'https://pitayanails.com',
  url: 'https://pitayanails.com',
  telephone: '+52-998-590-0050',
  email: 'pitayanailscancun@gmail.com',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jardines del Sur 5',
    addressLocality: 'Cancún',
    addressRegion: 'Quintana Roo',
    postalCode: '77500',
    addressCountry: 'MX',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 21.1619,
    longitude: -86.8515,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '21:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/nailstation_cun',
    'https://www.facebook.com/profile.php?id=61569280002188',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
});

export const getServiceSchema = (serviceId: string) => {
  const service = SERVICES.find(s => s.id === serviceId);
  if (!service) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.name,
    provider: {
      '@type': 'BeautySalon',
      name: 'Pitaya Nails',
      url: 'https://pitayanails.com',
    },
    description: service.description,
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'MXN',
      availability: 'https://schema.org/InStock',
    },
    areaServed: {
      '@type': 'City',
      name: 'Cancún',
      '@id': 'https://www.wikidata.org/wiki/Q8969',
    },
  };
};

export const getBookingSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ReservationAction',
  target: {
    '@type': 'EntryPoint',
    urlTemplate: 'https://pitayanails.com/servicios',
    actionPlatform: [
      'http://schema.org/DesktopWebPlatform',
      'http://schema.org/MobileWebPlatform',
    ],
  },
  result: {
    '@type': 'Reservation',
    name: 'Reserva de Cita en Pitaya Nails',
  },
});

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Pitaya Nails',
  alternateName: 'Pitaya Nails Cancún',
  url: 'https://pitayanails.com',
  logo: 'https://pitayanails.com/icon-512x512.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+52-998-590-0050',
    contactType: 'customer service',
    email: 'pitayanailscancun@gmail.com',
    areaServed: 'MX',
    availableLanguage: ['Spanish', 'English'],
  },
  sameAs: [
    'https://www.instagram.com/nailstation_cun',
    'https://www.facebook.com/profile.php?id=61569280002188',
  ],
});
