import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search across shows, tours, and locations' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query() searchDto: SearchDto) {
    return this.searchService.search(searchDto);
  }
}
