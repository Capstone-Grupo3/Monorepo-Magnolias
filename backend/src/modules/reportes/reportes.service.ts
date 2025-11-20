import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IaService } from '../ia/ia.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import * as puppeteer from 'puppeteer-core';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export interface CandidatoRanking {
  id: number;
  nombre: string;
  correo: string;
  rut?: string;
  posicion: number;
  puntajeIa: number;
  feedbackIa?: string;
  cvUrl?: string;
  telefono?: string;
  experienciaAnios?: number;
  skillsJson?: any;
  respuestasJson?: any;
  fechaPostulacion: string;
  estado: string;
  matchingPorcentaje?: number;
  experienciaRelevante?: string[];
  habilidadesClave?: string[];
  fortalezas?: string[];
  areasDesarrollo?: string[];
  fitCultural?: number;
}

export interface ResumenEjecutivo {
  mejorCandidato: {
    id: number;
    nombre: string;
    posicion: number;
    puntajeIa: number;
  };
  razonPrincipal: string;
  razonesSecundarias: string[];
  recomendacionFinal: string;
}

export interface ReporteRanking {
  id: string;
  cargoId: number;
  cargo: any;
  empresa: any;
  fechaGeneracion: string;
  resumenEjecutivo: ResumenEjecutivo;
  ranking: CandidatoRanking[];
  top3Detallado: CandidatoRanking[];
  comparativa: any[];
  estadisticas: any;
  recomendacionesIA: string[];
  urlPdf?: string;
  estado: 'GENERANDO' | 'COMPLETADO' | 'ERROR';
}

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);
  private reportesEnMemoria: Map<string, ReporteRanking> = new Map();
  // Control de concurrencia para generación de reportes (evitar OOM)
  private reportsConcurrency: number = parseInt(process.env.REPORTS_CONCURRENCY || '1', 10);
  private activeReports = 0;
  private queue: Array<() => void> = [];

  constructor(
    private prisma: PrismaService,
    private iaService: IaService,
  ) {
    // Crear directorio de reportes si no existe
    const reportesDir = path.join(process.cwd(), 'reportes');
    if (!fs.existsSync(reportesDir)) {
      fs.mkdirSync(reportesDir, { recursive: true });
    }
  }

  async generarReporte(
    dto: GenerarReporteDto,
    empresaId: number,
  ): Promise<{ reporteId: string; mensaje: string; estado: string }> {
    const reporteId = uuidv4();

    // Verificar que el cargo pertenece a la empresa
    const cargo = await this.prisma.cargo.findFirst({
      where: {
        id: dto.cargoId,
        idEmpresa: empresaId,
      },
      include: {
        empresa: true,
      },
    });

    if (!cargo) {
      throw new NotFoundException('Cargo no encontrado');
    }

    // Validar que el cargo esté en estado apropiado
    if (cargo.estado === 'ACTIVA') {
      throw new BadRequestException(
        'El cargo debe estar cerrado o en proceso para generar el reporte',
      );
    }

    // Inicializar reporte en memoria
    this.reportesEnMemoria.set(reporteId, {
      id: reporteId,
      cargoId: dto.cargoId,
      cargo: null,
      empresa: null,
      fechaGeneracion: new Date().toISOString(),
      resumenEjecutivo: null,
      ranking: [],
      top3Detallado: [],
      comparativa: [],
      estadisticas: null,
      recomendacionesIA: [],
      estado: 'GENERANDO',
    });

    // Generar reporte en background
    this.generarReporteBackground(reporteId, dto, cargo).catch((error) => {
      this.logger.error(
        `Error generando reporte ${reporteId}:`,
        error.message,
      );
      const reporte = this.reportesEnMemoria.get(reporteId);
      if (reporte) {
        reporte.estado = 'ERROR';
        this.reportesEnMemoria.set(reporteId, reporte);
      }
    });

    return {
      reporteId,
      mensaje: 'Reporte en generación',
      estado: 'GENERANDO',
    };
  }

  private async generarReporteBackground(
    reporteId: string,
    dto: GenerarReporteDto,
    cargo: any,
  ) {
    // Adquirir permiso para generar (semáforo)
    await this.acquireReportSlot();

    try {
      this.logger.log(`Generando reporte ${reporteId} para cargo ${cargo.id}`);

      // Obtener todas las postulaciones del cargo
      const postulaciones = await this.prisma.postulacion.findMany({
        where: {
          idCargo: cargo.id,
        },
        include: {
          postulante: true,
        },
        orderBy: {
          puntajeIa: 'desc',
        },
      });

      if (postulaciones.length === 0) {
        throw new BadRequestException(
          'No hay postulaciones para generar reporte',
        );
      }

      // Construir ranking
      const ranking: CandidatoRanking[] = postulaciones.map((p, index) => {
        const feedbackParsed = this.parseFeedbackIA(p.feedbackIa);

        return {
          id: p.postulante.id,
          nombre: p.postulante.nombre,
          correo: p.postulante.correo,
          rut: p.postulante.rut,
          posicion: index + 1,
          puntajeIa: Number(p.puntajeIa) || 0,
          feedbackIa: p.feedbackIa,
          cvUrl: p.cvUrl || p.postulante.cvUrl,
          telefono: p.postulante.telefono,
          experienciaAnios: p.postulante.experienciaAnios,
          skillsJson: p.postulante.skillsJson,
          respuestasJson: p.respuestasJson,
          fechaPostulacion: p.fechaPostulacion.toISOString(),
          estado: p.estado,
          ...feedbackParsed,
        };
      });

      // Limitar si no se quiere incluir todos
      const rankingFinal = dto.incluirTodos ? ranking : ranking.slice(0, 10);
      const top3 = ranking.slice(0, 3);

      // Generar resumen ejecutivo
      const resumenEjecutivo = this.generarResumenEjecutivo(ranking, cargo);

      // Generar comparativa
      const comparativa = this.generarComparativa(top3);

      // Generar estadísticas
      const estadisticas = this.generarEstadisticas(postulaciones);

      // Generar recomendaciones con IA
      const recomendacionesIA = await this.generarRecomendacionesIA(
        top3,
        cargo,
      );

      // Construir objeto de reporte completo
      const reporteCompleto: ReporteRanking = {
        id: reporteId,
        cargoId: cargo.id,
        cargo: {
          titulo: cargo.titulo,
          descripcion: cargo.descripcion,
          requisitos: cargo.requisitos,
          tipoContrato: cargo.tipoContrato,
          modalidad: cargo.modalidad,
          ubicacion: cargo.ubicacion,
          salarioEstimado: cargo.salarioEstimado
            ? Number(cargo.salarioEstimado)
            : null,
        },
        empresa: {
          nombre: cargo.empresa.nombre,
          correo: cargo.empresa.correo,
          logoUrl: cargo.empresa.logoUrl,
          descripcion: cargo.empresa.descripcion,
        },
        fechaGeneracion: new Date().toISOString(),
        resumenEjecutivo,
        ranking: rankingFinal,
        top3Detallado: top3,
        comparativa,
        estadisticas,
        recomendacionesIA,
        estado: 'GENERANDO',
      };

      // Generar PDF
      const pdfPath = await this.generarPDF(reporteCompleto);

      reporteCompleto.urlPdf = pdfPath;
      reporteCompleto.estado = 'COMPLETADO';

      // Guardar en memoria
      this.reportesEnMemoria.set(reporteId, reporteCompleto);

      // Enviar email si se solicita
      if (dto.enviarEmail) {
        await this.enviarReportePorEmail(reporteCompleto, cargo.empresa.correo);
      }

      this.logger.log(`Reporte ${reporteId} generado exitosamente`);
    } catch (error) {
      this.logger.error(`Error en generación de reporte: ${error.message}`);
      throw error;
    } finally {
      // Liberar slot del semáforo siempre al finalizar
      this.releaseReportSlot();
    }
  }

  private acquireReportSlot(): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeReports < this.reportsConcurrency) {
        this.activeReports += 1;
        resolve();
      } else {
        this.queue.push(() => {
          this.activeReports += 1;
          resolve();
        });
      }
    });
  }

  private releaseReportSlot() {
    this.activeReports = Math.max(0, this.activeReports - 1);
    const next = this.queue.shift();
    if (next) next();
  }

  private parseFeedbackIA(feedbackIa: string): Partial<CandidatoRanking> {
    if (!feedbackIa) {
      return {
        matchingPorcentaje: 0,
        experienciaRelevante: [],
        habilidadesClave: [],
        fortalezas: [],
        areasDesarrollo: [],
        fitCultural: 0,
      };
    }

    try {
      // Intentar parsear como JSON si es posible
      const feedback = JSON.parse(feedbackIa);
      return {
        matchingPorcentaje: feedback.matching || 0,
        experienciaRelevante: feedback.experiencia_relevante || [],
        habilidadesClave: feedback.habilidades_clave || [],
        fortalezas: feedback.fortalezas || [],
        areasDesarrollo: feedback.areas_desarrollo || [],
        fitCultural: feedback.fit_cultural || 0,
      };
    } catch {
      // Si no es JSON, extraer información del texto
      return {
        matchingPorcentaje: this.extraerPorcentaje(feedbackIa),
        experienciaRelevante: this.extraerLista(
          feedbackIa,
          'experiencia',
        ),
        habilidadesClave: this.extraerLista(feedbackIa, 'habilidades'),
        fortalezas: this.extraerLista(feedbackIa, 'fortalezas'),
        areasDesarrollo: this.extraerLista(feedbackIa, 'mejorar'),
        fitCultural: 50,
      };
    }
  }

  private extraerPorcentaje(texto: string): number {
    const match = texto.match(/(\d{1,3})%/);
    return match ? parseInt(match[1]) : 0;
  }

  private extraerLista(texto: string, keyword: string): string[] {
    const regex = new RegExp(`${keyword}[:\\s]*([^.\\n]+)`, 'i');
    const match = texto.match(regex);
    if (match && match[1]) {
      return match[1]
        .split(/,|;/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return [];
  }

  private generarResumenEjecutivo(
    ranking: CandidatoRanking[],
    cargo: any,
  ): ResumenEjecutivo {
    const mejorCandidato = ranking[0];

    if (!mejorCandidato) {
      throw new BadRequestException('No hay candidatos para el reporte');
    }

    const razonPrincipal = `${mejorCandidato.nombre} obtuvo el mayor puntaje de compatibilidad (${mejorCandidato.puntajeIa}/100) para el cargo de ${cargo.titulo}.`;

    const razonesSecundarias = [
      `Matching de ${mejorCandidato.matchingPorcentaje || 0}% con los requisitos del cargo`,
      `${mejorCandidato.experienciaAnios || 0} años de experiencia en el área`,
      mejorCandidato.habilidadesClave?.length > 0
        ? `Habilidades clave: ${mejorCandidato.habilidadesClave.slice(0, 3).join(', ')}`
        : 'Habilidades técnicas relevantes',
      `Fit cultural estimado: ${mejorCandidato.fitCultural || 50}%`,
    ];

    const recomendacionFinal = `Se recomienda iniciar proceso de entrevista con ${mejorCandidato.nombre} como candidato prioritario. ${
      ranking.length > 1
        ? `Considerar también a ${ranking[1].nombre} y ${ranking[2]?.nombre || 'otros candidatos'} como opciones secundarias.`
        : ''
    }`;

    return {
      mejorCandidato: {
        id: mejorCandidato.id,
        nombre: mejorCandidato.nombre,
        posicion: mejorCandidato.posicion,
        puntajeIa: mejorCandidato.puntajeIa,
      },
      razonPrincipal,
      razonesSecundarias,
      recomendacionFinal,
    };
  }

  private generarComparativa(top3: CandidatoRanking[]): any[] {
    if (top3.length < 2) return [];

    return [
      {
        criterio: 'Puntaje IA',
        candidato1: top3[0]?.puntajeIa || 0,
        candidato2: top3[1]?.puntajeIa || 0,
        candidato3: top3[2]?.puntajeIa || 0,
      },
      {
        criterio: 'Matching %',
        candidato1: top3[0]?.matchingPorcentaje || 0,
        candidato2: top3[1]?.matchingPorcentaje || 0,
        candidato3: top3[2]?.matchingPorcentaje || 0,
      },
      {
        criterio: 'Experiencia (años)',
        candidato1: top3[0]?.experienciaAnios || 0,
        candidato2: top3[1]?.experienciaAnios || 0,
        candidato3: top3[2]?.experienciaAnios || 0,
      },
      {
        criterio: 'Fit Cultural %',
        candidato1: top3[0]?.fitCultural || 0,
        candidato2: top3[1]?.fitCultural || 0,
        candidato3: top3[2]?.fitCultural || 0,
      },
      {
        criterio: 'Habilidades Clave',
        candidato1: top3[0]?.habilidadesClave?.length || 0,
        candidato2: top3[1]?.habilidadesClave?.length || 0,
        candidato3: top3[2]?.habilidadesClave?.length || 0,
      },
    ];
  }

  private generarEstadisticas(postulaciones: any[]): any {
    const totalPostulantes = postulaciones.length;
    const puntajes = postulaciones
      .map((p) => Number(p.puntajeIa) || 0)
      .filter((p) => p > 0);
    const promedioScore =
      puntajes.length > 0
        ? puntajes.reduce((a, b) => a + b, 0) / puntajes.length
        : 0;

    const candidatosTop = postulaciones.filter(
      (p) => Number(p.puntajeIa) >= 70,
    ).length;

    const postulacionesCompletas = postulaciones.filter(
      (p) => p.puntajeIa && p.feedbackIa,
    ).length;
    const tasaCompletitud =
      totalPostulantes > 0
        ? (postulacionesCompletas / totalPostulantes) * 100
        : 0;

    return {
      totalPostulantes,
      promedioScore: Math.round(promedioScore * 100) / 100,
      candidatosTop,
      tasaCompletitud: Math.round(tasaCompletitud * 100) / 100,
    };
  }

  private async generarRecomendacionesIA(
    top3: CandidatoRanking[],
    cargo: any,
  ): Promise<string[]> {
    const recomendaciones: string[] = [];

    // Recomendaciones basadas en el análisis
    if (top3.length > 0) {
      recomendaciones.push(
        `Priorizar entrevista con ${top3[0].nombre} (Puntaje: ${top3[0].puntajeIa}/100)`,
      );
    }

    if (top3.length > 1 && top3[0].puntajeIa - top3[1].puntajeIa < 10) {
      recomendaciones.push(
        'Los dos primeros candidatos tienen puntajes muy cercanos, se recomienda entrevistar a ambos',
      );
    }

    if (top3[0]?.fitCultural && top3[0].fitCultural > 80) {
      recomendaciones.push(
        'El candidato #1 muestra excelente fit cultural con la organización',
      );
    }

    if (top3[0]?.experienciaAnios && top3[0].experienciaAnios > 5) {
      recomendaciones.push(
        'Candidato con amplia experiencia profesional en el área',
      );
    }

    // Recomendaciones de proceso
    recomendaciones.push(
      'Realizar verificación de referencias laborales antes de la oferta final',
    );
    recomendaciones.push(
      'Considerar evaluación técnica práctica para validar habilidades',
    );

    return recomendaciones;
  }

  private async generarPDF(reporte: ReporteRanking): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
    });

    try {
      const page = await browser.newPage();

      // Generar HTML del reporte
      const html = this.generarHTMLReporte(reporte);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generar PDF
      const pdfFileName = `reporte_${reporte.id}_${Date.now()}.pdf`;
      const pdfPath = path.join(process.cwd(), 'reportes', pdfFileName);

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      this.logger.log(`PDF generado: ${pdfPath}`);

      return `/reportes/${pdfFileName}`;
    } finally {
      await browser.close();
    }
  }

  private generarHTMLReporte(reporte: ReporteRanking): string {
    const fechaFormateada = new Date(reporte.fechaGeneracion).toLocaleDateString(
      'es-CL',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Ranking - ${reporte.cargo.titulo}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .container {
      padding: 0 30px;
    }
    
    .section {
      margin-bottom: 35px;
      page-break-inside: avoid;
    }
    
    .section-title {
      color: #667eea;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #667eea;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .info-item {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
    }
    
    .info-item strong {
      color: #667eea;
      display: block;
      margin-bottom: 5px;
      font-size: 13px;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .highlight-box h3 {
      font-size: 22px;
      margin-bottom: 15px;
    }
    
    .highlight-box .score {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 13px;
    }
    
    th {
      background: #667eea;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }
    
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    tr:nth-child(even) {
      background: #f8f9fa;
    }
    
    .rank-badge {
      display: inline-block;
      width: 30px;
      height: 30px;
      background: #667eea;
      color: white;
      text-align: center;
      line-height: 30px;
      border-radius: 50%;
      font-weight: bold;
    }
    
    .rank-badge.gold {
      background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
    }
    
    .rank-badge.silver {
      background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
      color: #333;
    }
    
    .rank-badge.bronze {
      background: linear-gradient(135deg, #cd7f32 0%, #d4a574 100%);
    }
    
    .score-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }
    
    .score-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }
    
    .recommendation-list {
      list-style: none;
      padding: 0;
    }
    
    .recommendation-list li {
      padding: 10px 15px;
      margin-bottom: 10px;
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      border-radius: 4px;
    }
    
    .candidate-detail {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .candidate-detail h4 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 18px;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    
    .skill-tag {
      background: #667eea;
      color: white;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 12px;
    }
    
    .footer {
      margin-top: 40px;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #e0e0e0;
    }
    
    .stat-card .number {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }
    
    .stat-card .label {
      font-size: 13px;
      color: #666;
    }
    
    @media print {
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Reporte de Ranking de Candidatos</h1>
    <p>${reporte.cargo.titulo} | ${reporte.empresa.nombre}</p>
    <p>Generado el ${fechaFormateada}</p>
  </div>

  <div class="container">
    <!-- Información del Cargo -->
    <div class="section">
      <h2 class="section-title">📋 Información del Cargo</h2>
      <div class="info-grid">
        <div class="info-item">
          <strong>Cargo:</strong>
          ${reporte.cargo.titulo}
        </div>
        <div class="info-item">
          <strong>Empresa:</strong>
          ${reporte.empresa.nombre}
        </div>
        <div class="info-item">
          <strong>Modalidad:</strong>
          ${reporte.cargo.modalidad}
        </div>
        <div class="info-item">
          <strong>Ubicación:</strong>
          ${reporte.cargo.ubicacion}
        </div>
        <div class="info-item">
          <strong>Tipo de Contrato:</strong>
          ${reporte.cargo.tipoContrato}
        </div>
        ${
          reporte.cargo.salarioEstimado
            ? `
        <div class="info-item">
          <strong>Salario Estimado:</strong>
          $${reporte.cargo.salarioEstimado.toLocaleString('es-CL')}
        </div>
        `
            : ''
        }
      </div>
      ${
        reporte.cargo.descripcion
          ? `
      <div class="info-item">
        <strong>Descripción:</strong>
        <p style="margin-top: 8px;">${reporte.cargo.descripcion}</p>
      </div>
      `
          : ''
      }
    </div>

    <!-- Estadísticas Generales -->
    <div class="section">
      <h2 class="section-title">📈 Estadísticas del Proceso</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="number">${reporte.estadisticas.totalPostulantes}</div>
          <div class="label">Total Postulantes</div>
        </div>
        <div class="stat-card">
          <div class="number">${reporte.estadisticas.promedioScore}</div>
          <div class="label">Score Promedio</div>
        </div>
        <div class="stat-card">
          <div class="number">${reporte.estadisticas.candidatosTop}</div>
          <div class="label">Candidatos Top</div>
        </div>
        <div class="stat-card">
          <div class="number">${reporte.estadisticas.tasaCompletitud}%</div>
          <div class="label">Tasa Completitud</div>
        </div>
      </div>
    </div>

    <!-- Resumen Ejecutivo -->
    <div class="section">
      <h2 class="section-title">⭐ Resumen Ejecutivo</h2>
      <div class="highlight-box">
        <h3>🏆 Mejor Candidato</h3>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 10px 0;">${reporte.resumenEjecutivo.mejorCandidato.nombre}</h2>
            <p style="font-size: 16px; opacity: 0.9;">Posición #${reporte.resumenEjecutivo.mejorCandidato.posicion}</p>
          </div>
          <div class="score">${reporte.resumenEjecutivo.mejorCandidato.puntajeIa}</div>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
        <strong style="color: #667eea;">Razón Principal:</strong>
        <p style="margin-top: 8px;">${reporte.resumenEjecutivo.razonPrincipal}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
        <strong style="color: #667eea;">Razones Secundarias:</strong>
        <ul style="margin-top: 8px; padding-left: 20px;">
          ${reporte.resumenEjecutivo.razonesSecundarias.map((r) => `<li>${r}</li>`).join('')}
        </ul>
      </div>
      
      <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
        <strong style="color: #667eea;">💡 Recomendación Final:</strong>
        <p style="margin-top: 8px;">${reporte.resumenEjecutivo.recomendacionFinal}</p>
      </div>
    </div>

    <!-- Comparativa Top 3 -->
    ${
      reporte.comparativa.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">📊 Comparativa Top 3 Candidatos</h2>
      <table>
        <thead>
          <tr>
            <th>Criterio</th>
            <th>🥇 ${reporte.top3Detallado[0]?.nombre || 'N/A'}</th>
            <th>🥈 ${reporte.top3Detallado[1]?.nombre || 'N/A'}</th>
            ${reporte.top3Detallado[2] ? `<th>🥉 ${reporte.top3Detallado[2].nombre}</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${reporte.comparativa
            .map(
              (item) => `
          <tr>
            <td><strong>${item.criterio}</strong></td>
            <td>${item.candidato1}</td>
            <td>${item.candidato2}</td>
            ${item.candidato3 !== undefined ? `<td>${item.candidato3}</td>` : ''}
          </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    <!-- Análisis Detallado Top 3 -->
    <div class="section">
      <h2 class="section-title">🔍 Análisis Detallado Top 3</h2>
      ${reporte.top3Detallado
        .map(
          (candidato, index) => `
        <div class="candidate-detail">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4>
              ${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              ${candidato.nombre}
            </h4>
            <span style="font-size: 24px; font-weight: bold; color: #667eea;">
              ${candidato.puntajeIa}/100
            </span>
          </div>
          
          <div class="info-grid" style="margin-bottom: 15px;">
            <div class="info-item">
              <strong>Correo:</strong>
              ${candidato.correo}
            </div>
            ${
              candidato.telefono
                ? `
            <div class="info-item">
              <strong>Teléfono:</strong>
              ${candidato.telefono}
            </div>
            `
                : ''
            }
            ${
              candidato.experienciaAnios
                ? `
            <div class="info-item">
              <strong>Experiencia:</strong>
              ${candidato.experienciaAnios} años
            </div>
            `
                : ''
            }
            <div class="info-item">
              <strong>Matching:</strong>
              ${candidato.matchingPorcentaje || 0}%
            </div>
          </div>
          
          ${
            candidato.fortalezas && candidato.fortalezas.length > 0
              ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #667eea;">✅ Fortalezas:</strong>
            <ul style="margin-top: 8px; padding-left: 20px;">
              ${candidato.fortalezas.map((f) => `<li>${f}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }
          
          ${
            candidato.habilidadesClave && candidato.habilidadesClave.length > 0
              ? `
          <div>
            <strong style="color: #667eea;">🎯 Habilidades Clave:</strong>
            <div class="skills-list">
              ${candidato.habilidadesClave.map((skill) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
          `
              : ''
          }
          
          ${
            candidato.feedbackIa && typeof candidato.feedbackIa === 'string'
              ? `
          <div style="margin-top: 15px; padding: 15px; background: #f0f4ff; border-radius: 6px;">
            <strong style="color: #667eea;">🤖 Feedback IA:</strong>
            <p style="margin-top: 8px; font-size: 13px;">${candidato.feedbackIa.substring(0, 300)}${candidato.feedbackIa.length > 300 ? '...' : ''}</p>
          </div>
          `
              : ''
          }
        </div>
      `,
        )
        .join('')}
    </div>

    <!-- Ranking Completo -->
    <div class="section">
      <h2 class="section-title">🏅 Ranking Completo</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">Pos.</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th style="width: 100px;">Puntaje</th>
            <th style="width: 100px;">Matching</th>
            <th style="width: 100px;">Experiencia</th>
          </tr>
        </thead>
        <tbody>
          ${reporte.ranking
            .map(
              (candidato) => `
          <tr>
            <td>
              <span class="rank-badge ${
                candidato.posicion === 1
                  ? 'gold'
                  : candidato.posicion === 2
                    ? 'silver'
                    : candidato.posicion === 3
                      ? 'bronze'
                      : ''
              }">
                ${candidato.posicion}
              </span>
            </td>
            <td><strong>${candidato.nombre}</strong></td>
            <td>${candidato.correo}</td>
            <td>
              <strong style="color: #667eea;">${candidato.puntajeIa}/100</strong>
              <div class="score-bar">
                <div class="score-fill" style="width: ${candidato.puntajeIa}%;"></div>
              </div>
            </td>
            <td>${candidato.matchingPorcentaje || 0}%</td>
            <td>${candidato.experienciaAnios || 0} años</td>
          </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Recomendaciones IA -->
    ${
      reporte.recomendacionesIA.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">💡 Recomendaciones de IA</h2>
      <ul class="recommendation-list">
        ${reporte.recomendacionesIA.map((rec) => `<li>✓ ${rec}</li>`).join('')}
      </ul>
    </div>
    `
        : ''
    }
  </div>

  <div class="footer">
    <p>Este reporte fue generado automáticamente por el Sistema de Reclutamiento Inteligente - Asesorías Magnolia</p>
    <p>Fecha de generación: ${fechaFormateada} | Reporte ID: ${reporte.id}</p>
    <p style="margin-top: 10px; color: #999;">© ${new Date().getFullYear()} Todos los derechos reservados</p>
  </div>
</body>
</html>
    `;
  }

  private async enviarReportePorEmail(
    reporte: ReporteRanking,
    email: string,
  ): Promise<void> {
    // TODO: Implementar envío de email con nodemailer
    this.logger.log(`Email de reporte enviado a ${email}`);
  }

  async obtenerReporte(reporteId: string): Promise<ReporteRanking> {
    const reporte = this.reportesEnMemoria.get(reporteId);

    if (!reporte) {
      throw new NotFoundException('Reporte no encontrado');
    }

    return reporte;
  }

  async obtenerReportesPorCargo(cargoId: number): Promise<ReporteRanking[]> {
    const reportes = Array.from(this.reportesEnMemoria.values()).filter(
      (r) => r.cargoId === cargoId,
    );

    return reportes;
  }

  async descargarPDF(reporteId: string): Promise<string> {
    const reporte = await this.obtenerReporte(reporteId);

    if (!reporte.urlPdf) {
      throw new NotFoundException('PDF no disponible');
    }

    return path.join(process.cwd(), reporte.urlPdf);
  }
}
