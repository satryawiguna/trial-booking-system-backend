import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ListTrialClassesUseCase } from '../../application/use-cases/list-trial-classes';
import { GetTrialClassDetailUseCase } from '../../application/use-cases/get-trial-class-detail';
import { GetRosterUseCase } from '../../application/use-cases/get-roster';
import { RosterResponseDto } from '../dto/roster-response.dto';

@ApiTags('trial-classes')
@Controller('trial-classes')
export class TrialClassesController {
  constructor(
    private readonly listUseCase: ListTrialClassesUseCase,
    private readonly detailUseCase: GetTrialClassDetailUseCase,
    private readonly rosterUseCase: GetRosterUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all trial classes with spot availability' })
  @ApiResponse({ status: 200, description: 'Trial classes retrieved' })
  async list() {
    return this.listUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trial class details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Trial class detail' })
  @ApiResponse({ status: 404, description: 'Trial class not found' })
  async detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.detailUseCase.execute(id);
  }

  @Get(':id/roster')
  @ApiOperation({ summary: 'Get confirmed participant roster' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Roster retrieved (confirmed only)',
    type: RosterResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Trial class not found' })
  async roster(@Param('id', ParseUUIDPipe) id: string) {
    return this.rosterUseCase.execute(id);
  }
}
