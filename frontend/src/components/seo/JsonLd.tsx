interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  const normalize = () => {
    if (Array.isArray(data)) {
      return {
        '@context': 'https://schema.org',
        '@graph': data,
      };
    }

    if ('@graph' in data && data['@graph']) {
      return data;
    }

    const node = { ...data };
    if ('@context' in node) {
      delete node['@context'];
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [node],
    };
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(normalize()) }}
    />
  );
}
