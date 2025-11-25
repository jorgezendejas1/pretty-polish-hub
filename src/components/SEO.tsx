import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object;
}

export const SEO = ({
  title = 'Pitaya Nails - Salón de Uñas Premium en Cancún',
  description = 'Studio de uñas profesional especializado en manicura, pedicura y diseños exclusivos en Cancún. Reserva tu cita hoy.',
  image = 'https://lovable.dev/opengraph-image-p98pqg.png',
  url = 'https://pitayanails.com',
  type = 'website',
  jsonLd,
}: SEOProps) => {
  const fullTitle = title.includes('Pitaya Nails') ? title : `${title} | Pitaya Nails`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="es_MX" />
      <meta property="og:site_name" content="Pitaya Nails" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
