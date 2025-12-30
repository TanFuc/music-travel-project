import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Public()
  @Get('geocode')
  @ApiOperation({ summary: 'Geocode an address to coordinates' })
  @ApiQuery({ name: 'address', description: 'Address to geocode' })
  @ApiResponse({ status: 200, description: 'Geocoding successful' })
  async geocode(@Query('address') address: string) {
    return this.mapsService.geocodeAddress(address);
  }

  @Public()
  @Get('reverse-geocode')
  @ApiOperation({ summary: 'Reverse geocode coordinates to address' })
  @ApiQuery({ name: 'lat', description: 'Latitude' })
  @ApiQuery({ name: 'lng', description: 'Longitude' })
  @ApiResponse({ status: 200, description: 'Reverse geocoding successful' })
  async reverseGeocode(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.mapsService.reverseGeocode(parseFloat(lat), parseFloat(lng));
  }

  @Public()
  @Get('place')
  @ApiOperation({ summary: 'Get place details by place ID' })
  @ApiQuery({ name: 'placeId', description: 'Google Place ID' })
  @ApiResponse({ status: 200, description: 'Place details retrieved' })
  async getPlaceDetails(@Query('placeId') placeId: string) {
    return this.mapsService.getPlaceDetails(placeId);
  }

  @Public()
  @Get('nearby')
  @ApiOperation({ summary: 'Search places nearby' })
  @ApiQuery({ name: 'lat', description: 'Latitude' })
  @ApiQuery({ name: 'lng', description: 'Longitude' })
  @ApiQuery({ name: 'radius', description: 'Search radius in meters', required: false })
  @ApiQuery({ name: 'type', description: 'Place type (e.g., restaurant, hotel)', required: false })
  @ApiResponse({ status: 200, description: 'Nearby places retrieved' })
  async searchNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('type') type?: string,
  ) {
    return this.mapsService.searchNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius, 10) : 1000,
      type,
    );
  }

  @Public()
  @Get('directions')
  @ApiOperation({ summary: 'Get directions between two points' })
  @ApiQuery({ name: 'originLat', description: 'Origin latitude' })
  @ApiQuery({ name: 'originLng', description: 'Origin longitude' })
  @ApiQuery({ name: 'destLat', description: 'Destination latitude' })
  @ApiQuery({ name: 'destLng', description: 'Destination longitude' })
  @ApiQuery({
    name: 'mode',
    description: 'Travel mode',
    required: false,
    enum: ['driving', 'walking', 'transit'],
  })
  @ApiResponse({ status: 200, description: 'Directions retrieved' })
  async getDirections(
    @Query('originLat') originLat: string,
    @Query('originLng') originLng: string,
    @Query('destLat') destLat: string,
    @Query('destLng') destLng: string,
    @Query('mode') mode?: 'driving' | 'walking' | 'transit',
  ) {
    return this.mapsService.getDirections(
      parseFloat(originLat),
      parseFloat(originLng),
      parseFloat(destLat),
      parseFloat(destLng),
      mode || 'driving',
    );
  }

  @Public()
  @Get('static-map')
  @ApiOperation({ summary: 'Get static map image URL' })
  @ApiQuery({ name: 'lat', description: 'Latitude' })
  @ApiQuery({ name: 'lng', description: 'Longitude' })
  @ApiQuery({ name: 'zoom', description: 'Zoom level', required: false })
  @ApiQuery({ name: 'width', description: 'Image width', required: false })
  @ApiQuery({ name: 'height', description: 'Image height', required: false })
  @ApiResponse({ status: 200, description: 'Static map URL generated' })
  async getStaticMapUrl(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('zoom') zoom?: string,
    @Query('width') width?: string,
    @Query('height') height?: string,
  ) {
    const url = this.mapsService.getStaticMapUrl(parseFloat(lat), parseFloat(lng), {
      zoom: zoom ? parseInt(zoom, 10) : undefined,
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
    });
    return { url };
  }

  @Public()
  @Get('embed-url')
  @ApiOperation({ summary: 'Get embed URL for iframe' })
  @ApiQuery({ name: 'lat', description: 'Latitude' })
  @ApiQuery({ name: 'lng', description: 'Longitude' })
  @ApiQuery({ name: 'zoom', description: 'Zoom level', required: false })
  @ApiResponse({ status: 200, description: 'Embed URL generated' })
  async getEmbedUrl(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('zoom') zoom?: string,
  ) {
    const url = this.mapsService.getEmbedUrl(
      parseFloat(lat),
      parseFloat(lng),
      zoom ? parseInt(zoom, 10) : undefined,
    );
    return { url };
  }

  @Public()
  @Get('directions-link')
  @ApiOperation({ summary: 'Get Google Maps directions link' })
  @ApiQuery({ name: 'lat', description: 'Destination latitude' })
  @ApiQuery({ name: 'lng', description: 'Destination longitude' })
  @ApiQuery({ name: 'name', description: 'Destination name', required: false })
  @ApiResponse({ status: 200, description: 'Directions link generated' })
  async getDirectionsLink(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('name') name?: string,
  ) {
    const link = this.mapsService.getDirectionsLink(parseFloat(lat), parseFloat(lng), name);
    return { link };
  }

  @Public()
  @Get('distance')
  @ApiOperation({ summary: 'Calculate distance between two points' })
  @ApiQuery({ name: 'lat1', description: 'First point latitude' })
  @ApiQuery({ name: 'lng1', description: 'First point longitude' })
  @ApiQuery({ name: 'lat2', description: 'Second point latitude' })
  @ApiQuery({ name: 'lng2', description: 'Second point longitude' })
  @ApiResponse({ status: 200, description: 'Distance calculated' })
  async calculateDistance(
    @Query('lat1') lat1: string,
    @Query('lng1') lng1: string,
    @Query('lat2') lat2: string,
    @Query('lng2') lng2: string,
  ) {
    const distanceKm = this.mapsService.calculateDistance(
      parseFloat(lat1),
      parseFloat(lng1),
      parseFloat(lat2),
      parseFloat(lng2),
    );
    return {
      distanceKm: Math.round(distanceKm * 100) / 100,
      distanceMeters: Math.round(distanceKm * 1000),
    };
  }
}
