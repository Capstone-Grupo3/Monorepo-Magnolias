import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: LoginAdminDto) {
    return this.adminService.loginAdmin(loginDto);
  }

  @Post('register')
  async register(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Get('dashboard/stats')
  @UseGuards(AdminGuard)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @UseGuards(AdminGuard)
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('tipo') tipo?: 'postulante' | 'empresa',
    @Query('search') search?: string,
    @Query('estado') estado?: string,
  ) {
    return this.adminService.getAllUsers({ page, limit, tipo, search, estado });
  }

  @Get('postulaciones')
  @UseGuards(AdminGuard)
  async getAllPostulaciones(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('empresaId', new ParseIntPipe({ optional: true })) empresaId?: number,
    @Query('cargoId', new ParseIntPipe({ optional: true })) cargoId?: number,
    @Query('estado') estado?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.adminService.getAllPostulaciones({
      page,
      limit,
      empresaId,
      cargoId,
      estado,
      fechaInicio,
      fechaFin,
    });
  }

  @Get('postulaciones/:id')
  @UseGuards(AdminGuard)
  async getPostulacionDetails(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getPostulacionDetails(id);
  }

  @Get('rankings')
  @UseGuards(AdminGuard)
  async getRankings(@Query('cargoId', new ParseIntPipe({ optional: true })) cargoId?: number) {
    return this.adminService.getRankingsByCargo(cargoId);
  }

  @Get('stats/postulaciones')
  @UseGuards(AdminGuard)
  async getPostulacionesStats(@Query('periodo') periodo: 'mes' | 'semana' = 'mes') {
    return this.adminService.getPostulacionesStats(periodo);
  }

  @Get('stats/top-cargos')
  @UseGuards(AdminGuard)
  async getTopCargos(@Query('limit', new ParseIntPipe({ optional: true })) limit: number = 5) {
    return this.adminService.getTopCargos(limit);
  }

  @Get('raw/:entity/:id')
  @UseGuards(AdminGuard)
  async getRawData(
    @Param('entity') entity: 'usuario' | 'postulacion' | 'cargo' | 'empresa',
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.getRawData(entity, id);
  }
}
