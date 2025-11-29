import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdatePostulanteDto, UpdateEmpresaDto } from './dto/update-user.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';
import { UpdateCargoDto, CreateCargoAdminDto } from './dto/update-cargo.dto';
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

  // ==================== CRUD POSTULANTES ====================

  @Put('postulantes/:id')
  @UseGuards(AdminGuard)
  async updatePostulante(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePostulanteDto,
  ) {
    return this.adminService.updatePostulante(id, updateDto);
  }

  @Delete('postulantes/:id')
  @UseGuards(AdminGuard)
  async deletePostulante(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePostulante(id);
  }

  // ==================== CRUD EMPRESAS ====================

  @Get('empresas')
  @UseGuards(AdminGuard)
  async getAllEmpresas(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllEmpresas({ page, limit, estado, search });
  }

  @Get('empresas/simple')
  @UseGuards(AdminGuard)
  async getEmpresasSimple() {
    return this.adminService.getEmpresasSimple();
  }

  @Put('empresas/:id')
  @UseGuards(AdminGuard)
  async updateEmpresa(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEmpresaDto,
  ) {
    return this.adminService.updateEmpresa(id, updateDto);
  }

  @Delete('empresas/:id')
  @UseGuards(AdminGuard)
  async deleteEmpresa(
    @Param('id', ParseIntPipe) id: number,
    @Query('hard') hard?: string,
  ) {
    return this.adminService.deleteEmpresa(id, hard === 'true');
  }

  // ==================== CRUD POSTULACIONES ====================

  @Put('postulaciones/:id')
  @UseGuards(AdminGuard)
  async updatePostulacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePostulacionDto,
  ) {
    return this.adminService.updatePostulacion(id, updateDto);
  }

  @Delete('postulaciones/:id')
  @UseGuards(AdminGuard)
  async deletePostulacion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePostulacion(id);
  }

  // ==================== CRUD CARGOS ====================

  @Get('cargos')
  @UseGuards(AdminGuard)
  async getAllCargos(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('empresaId', new ParseIntPipe({ optional: true })) empresaId?: number,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllCargos({ page, limit, empresaId, estado, search });
  }

  @Post('cargos')
  @UseGuards(AdminGuard)
  async createCargo(@Body() createDto: CreateCargoAdminDto) {
    return this.adminService.createCargo(createDto);
  }

  @Put('cargos/:id')
  @UseGuards(AdminGuard)
  async updateCargo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCargoDto,
  ) {
    return this.adminService.updateCargo(id, updateDto);
  }

  @Delete('cargos/:id')
  @UseGuards(AdminGuard)
  async deleteCargo(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCargo(id);
  }
}
