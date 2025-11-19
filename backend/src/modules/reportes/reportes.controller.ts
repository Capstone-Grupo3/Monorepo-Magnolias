import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportesService } from './reportes.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post('generar')
  async generarReporte(@Body() dto: GenerarReporteDto, @Request() req) {
    // Verificar que el usuario sea una empresa
    if (req.user.tipo !== 'empresa') {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Solo las empresas pueden generar reportes',
      };
    }

    const resultado = await this.reportesService.generarReporte(
      dto,
      req.user.id,
    );

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Reporte en generación',
      data: resultado,
    };
  }

  @Get(':reporteId')
  async obtenerReporte(@Param('reporteId') reporteId: string, @Request() req) {
    const reporte = await this.reportesService.obtenerReporte(reporteId);

    // Aquí podrías agregar validación para verificar que la empresa
    // sea dueña del cargo asociado al reporte

    return {
      statusCode: HttpStatus.OK,
      data: reporte,
    };
  }

  @Get('cargo/:cargoId')
  async obtenerReportesPorCargo(
    @Param('cargoId') cargoId: string,
    @Request() req,
  ) {
    const reportes = await this.reportesService.obtenerReportesPorCargo(
      parseInt(cargoId),
    );

    return {
      statusCode: HttpStatus.OK,
      data: reportes,
    };
  }

  @Get(':reporteId/descargar')
  async descargarPDF(
    @Param('reporteId') reporteId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdfPath = await this.reportesService.descargarPDF(reporteId);

    const file = fs.createReadStream(pdfPath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte_${reporteId}.pdf"`,
    });

    return new StreamableFile(file);
  }
}
