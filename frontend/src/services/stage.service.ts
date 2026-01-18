import { get, post, patch, del } from '@/lib/api';

export interface CreateStageDto {
  locationId: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  mapLink?: string;
  seatMapConfig?: Record<string, any>;
  seatMapTemplate?: number;
}

export interface UpdateStageDto extends Partial<CreateStageDto> {}

export interface Stage {
  id: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  mapLink?: string;
  seatMapConfig?: Record<string, any>;
  seatMapTemplate?: number;
  location: {
    id: number;
    name: string;
    slug: string;
  };
  activeShowCount?: number;
}

export interface PhysicalSeat {
  id: number;
  stageId: number;
  zoneName?: string;
  rowName?: string;
  seatNumber?: string;
  type: 'SEAT' | 'STANDING';
  position: {
    x?: number;
    y?: number;
  };
  isAvailable?: boolean;
  status?: string;
  ticketClassId?: number;
}

export const stageService = {
  // Get all stages
  getStages: async (locationId?: number): Promise<Stage[]> => {
    const params = locationId ? `?locationId=${locationId}` : '';
    return get<Stage[]>(`/stages${params}`);
  },

  // Get stage by slug
  getStageBySlug: async (slug: string): Promise<Stage> => {
    return get<Stage>(`/stages/${slug}`);
  },

  // Create stage
  createStage: async (data: CreateStageDto): Promise<Stage> => {
    return post<Stage, CreateStageDto>('/stages', data);
  },

  // Update stage
  updateStage: async (id: number, data: UpdateStageDto): Promise<Stage> => {
    return patch<Stage, UpdateStageDto>(`/stages/${id}`, data);
  },

  // Delete stage
  deleteStage: async (id: number): Promise<void> => {
    return del<void>(`/stages/${id}`);
  },

  // Get physical seats
  getPhysicalSeats: async (stageId: number, showId?: number): Promise<PhysicalSeat[]> => {
    const params = showId ? `?showId=${showId}` : '';
    return get<PhysicalSeat[]>(`/stages/${stageId}/seats${params}`);
  },
};
