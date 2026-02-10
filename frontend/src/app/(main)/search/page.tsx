/**
 * Search Page - SSR (Server-Side Rendering)
 * Server Component with dynamic rendering for real-time search
 *
 * Features:
 * - Server-side initial data fetch for SEO
 * - Dynamic rendering (no caching) for real-time results
 * - Client-side interactivity for filters and pagination
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchResultsClient } from '@/components/client/SearchResultsClient';
import { SearchResultsSkeleton } from '@/components/server/Skeletons';
import { fetchServer } from '@/lib/api-server';

// Force dynamic rendering (SSR)
export const dynamic = 'force-dynamic';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Tìm kiếm | Music Travel',
  description: 'Tìm kiếm show âm nhạc, tour du lịch và địa điểm tại Music Travel',
};

type SearchType = 'all' | 'shows' | 'tours' | 'locations';

interface SearchParams {
  q?: string;
  type?: SearchType;
  branchId?: string;
  page?: string;
}

interface Branch {
  id: number;
  name: string;
}

interface ShowResult {
  id: number;
  title: string;
  slug: string;
  status: string;
  performTime: string;
  minPrice: number | null;
  availableTickets: number;
  stage: {
    name: string;
    location: { name: string };
  };
}

interface TourResult {
  id: number;
  title: string;
  slug: string;
  duration: string | null;
  minPrice: number | null;
  departureLoc: { name: string } | null;
  destinationLoc: { name: string } | null;
  nextSchedule: { startDate: string } | null;
}

interface LocationResult {
  id: number;
  name: string;
  slug: string;
  showCount: number;
}

interface SearchResults {
  shows: { items: ShowResult[]; total: number };
  tours: { items: TourResult[]; total: number };
  locations: { items: LocationResult[]; total: number };
}

// Fetch search results on server
async function fetchSearchResults(
  query: string,
  type: SearchType,
  branchId?: string,
  page: number = 1
): Promise<SearchResults | null> {
  if (!query) return null;

  try {
    const params: Record<string, string | number> = {
      q: query,
      type,
      page,
      limit: 12,
    };
    if (branchId) {
      params.branchId = branchId;
    }

    const queryString = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();

    const results = await fetchServer<SearchResults>(`/search?${queryString}`, {
      cache: 'no-store', // Always fetch fresh data for search
    });
    return results;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return null;
  }
}

// Fetch branches for filter
async function fetchBranches(): Promise<Branch[]> {
  try {
    const branches = await fetchServer<Branch[]>('/branches', {
      revalidate: 600, // Cache branches for 10 minutes
      tags: ['branches'],
    });
    return branches || [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams.q || '';
  const type = (searchParams.type as SearchType) || 'all';
  const branchId = searchParams.branchId || '';
  const page = parseInt(searchParams.page || '1', 10);

  // Fetch data in parallel
  const [results, branches] = await Promise.all([
    query ? fetchSearchResults(query, type, branchId, page) : null,
    fetchBranches(),
  ]);

  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchResultsClient
        initialResults={results}
        branches={branches}
        initialQuery={query}
        initialType={type}
        initialBranchId={branchId}
        initialPage={page}
      />
    </Suspense>
  );
}
