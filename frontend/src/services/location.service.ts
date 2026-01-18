import { get } from '@/lib/api';

export interface Location {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl?: string;
}

export const locationService = {
  // Get all locations
  getLocations: async (): Promise<Location[]> => {
    return get<Location[]>('/locations');
  },

  // Get location by slug
  getLocationBySlug: async (slug: string): Promise<Location> => {
    return get<Location>(`/locations/${slug}`);
  },
};
