import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  openingHours?: string[];
  photos?: string[];
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  polyline: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
}

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY is not configured');
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!this.apiKey) {
      throw new BadRequestException('Google Maps API chưa được cấu hình.');
    }

    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}&language=vi`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results?.length) {
        throw new BadRequestException('Không tìm thấy địa chỉ.');
      }

      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    } catch (error) {
      this.logger.error(`Geocode failed: ${error}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Không thể tìm tọa độ địa chỉ.');
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    if (!this.apiKey) {
      throw new BadRequestException('Google Maps API chưa được cấu hình.');
    }

    try {
      const url = `${this.baseUrl}/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}&language=vi`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results?.length) {
        throw new BadRequestException('Không tìm thấy địa chỉ cho tọa độ này.');
      }

      const result = data.results[0];
      return {
        lat,
        lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    } catch (error) {
      this.logger.error(`Reverse geocode failed: ${error}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Không thể tìm địa chỉ.');
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.apiKey) {
      throw new BadRequestException('Google Maps API chưa được cấu hình.');
    }

    try {
      const fields =
        'place_id,name,formatted_address,geometry,formatted_phone_number,website,rating,opening_hours,photos';
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}&language=vi`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result) {
        throw new BadRequestException('Không tìm thấy thông tin địa điểm.');
      }

      const result = data.result;
      return {
        placeId: result.place_id,
        name: result.name,
        formattedAddress: result.formatted_address,
        lat: result.geometry?.location?.lat,
        lng: result.geometry?.location?.lng,
        phoneNumber: result.formatted_phone_number,
        website: result.website,
        rating: result.rating,
        openingHours: result.opening_hours?.weekday_text,
        photos: result.photos
          ?.slice(0, 5)
          .map(
            (p: { photo_reference: string }) =>
              `${this.baseUrl}/place/photo?maxwidth=400&photo_reference=${p.photo_reference}&key=${this.apiKey}`,
          ),
      };
    } catch (error) {
      this.logger.error(`Get place details failed: ${error}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Không thể lấy thông tin địa điểm.');
    }
  }

  /**
   * Search places nearby
   */
  async searchNearby(
    lat: number,
    lng: number,
    radius = 1000,
    type?: string,
  ): Promise<
    Array<{
      placeId: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      rating?: number;
    }>
  > {
    if (!this.apiKey) {
      throw new BadRequestException('Google Maps API chưa được cấu hình.');
    }

    try {
      let url = `${this.baseUrl}/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${this.apiKey}&language=vi`;
      if (type) {
        url += `&type=${type}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new BadRequestException('Không thể tìm kiếm địa điểm.');
      }

      return (data.results || []).map((place: Record<string, unknown>) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity,
        lat: (place.geometry as Record<string, Record<string, number>>)?.location?.lat,
        lng: (place.geometry as Record<string, Record<string, number>>)?.location?.lng,
        rating: place.rating,
      }));
    } catch (error) {
      this.logger.error(`Search nearby failed: ${error}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Không thể tìm kiếm địa điểm xung quanh.');
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    mode: 'driving' | 'walking' | 'transit' = 'driving',
  ): Promise<DirectionsResult> {
    if (!this.apiKey) {
      throw new BadRequestException('Google Maps API chưa được cấu hình.');
    }

    try {
      const url = `${this.baseUrl}/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=${mode}&key=${this.apiKey}&language=vi`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.routes?.length) {
        throw new BadRequestException('Không tìm thấy đường đi.');
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        polyline: route.overview_polyline?.points || '',
        steps: leg.steps.map((step: Record<string, unknown>) => ({
          instruction: (step.html_instructions as string)?.replace(/<[^>]*>/g, '') || '',
          distance: (step.distance as Record<string, string>)?.text || '',
          duration: (step.duration as Record<string, string>)?.text || '',
        })),
      };
    } catch (error) {
      this.logger.error(`Get directions failed: ${error}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Không thể lấy chỉ đường.');
    }
  }

  /**
   * Generate static map image URL
   */
  getStaticMapUrl(
    lat: number,
    lng: number,
    options: {
      zoom?: number;
      width?: number;
      height?: number;
      mapType?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
      markerColor?: string;
    } = {},
  ): string {
    const {
      zoom = 15,
      width = 600,
      height = 300,
      mapType = 'roadmap',
      markerColor = 'red',
    } = options;

    if (!this.apiKey) {
      // Return a placeholder if no API key
      return `https://via.placeholder.com/${width}x${height}?text=Map+Not+Available`;
    }

    return `${this.baseUrl}/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=${mapType}&markers=color:${markerColor}%7C${lat},${lng}&key=${this.apiKey}`;
  }

  /**
   * Generate embed URL for iframe
   */
  getEmbedUrl(lat: number, lng: number, zoom = 15): string {
    if (!this.apiKey) {
      return '';
    }

    return `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=${lat},${lng}&zoom=${zoom}`;
  }

  /**
   * Generate directions link for Google Maps app
   */
  getDirectionsLink(destLat: number, destLng: number, destName?: string): string {
    const destination = destName ? encodeURIComponent(destName) : `${destLat},${destLng}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=`;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
