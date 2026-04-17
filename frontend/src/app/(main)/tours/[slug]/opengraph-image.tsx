import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Tour detail - Music Travel';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');

type TourApi = {
  title?: string;
  departureLoc?: {
    name?: string;
  };
  destinationLoc?: {
    name?: string;
  };
};

async function getTour(slug: string): Promise<TourApi | null> {
  try {
    const response = await fetch(`${API_URL}/tours/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.json();
    return (body?.data || body) as TourApi;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const tour = await getTour(params.slug);

  const title = (tour?.title || 'Music Travel Tour').slice(0, 90);
  const route = [tour?.departureLoc?.name, tour?.destinationLoc?.name].filter(Boolean).join(' -> ') || 'Explore Vietnam';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #09395e 0%, #0d6ea8 52%, #23b2b8 100%)',
          color: '#ffffff',
          padding: '56px',
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 1.5, opacity: 0.92 }}>MUSIC TRAVEL - TOUR</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.08 }}>{title}</div>
          <div style={{ fontSize: 34, opacity: 0.95 }}>{route}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, opacity: 0.92 }}>
          <div>Book now</div>
          <div>musictravel.vn</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
