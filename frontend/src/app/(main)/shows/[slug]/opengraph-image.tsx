import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export const alt = 'Show detail - Music Travel';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(
  /\/$/,
  ''
);
type ShowApi = {
  title?: string;
  stage?: {
    name?: string;
    location?: {
      name?: string;
    };
  };
  performTime?: string;
};
async function getShow(slug: string): Promise<ShowApi | null> {
  try {
    const response = await fetch(`${API_URL}/shows/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return null;
    }
    const body = await response.json();
    return (body?.data || body) as ShowApi;
  } catch {
    return null;
  }
}
export default async function OpenGraphImage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const show = await getShow(params.slug);
  const title = (show?.title || 'Music Travel Show').slice(0, 90);
  const stage = show?.stage?.name || show?.stage?.location?.name || 'Vietnam';
  const performDate = show?.performTime
    ? new Date(show.performTime).toLocaleDateString('vi-VN')
    : 'Cap nhat lich moi nhat';
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #0b4f2d 0%, #167c43 55%, #4ba969 100%)',
        color: '#ffffff',
        padding: '56px',
      }}
    >
      <div style={{ fontSize: 32, letterSpacing: 1.5, opacity: 0.92 }}>MUSIC TRAVEL - SHOW</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08 }}>{title}</div>
        <div style={{ fontSize: 36, opacity: 0.95 }}>{stage}</div>
      </div>

      <div
        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, opacity: 0.92 }}
      >
        <div>{performDate}</div>
        <div>maichohanhtinhxanh.com</div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
