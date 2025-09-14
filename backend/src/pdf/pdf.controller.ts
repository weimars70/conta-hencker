import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PdfService } from './pdf.service';

@ApiTags('pdf')
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('report')
  generateReport() {
    return this.pdfService.generateReport();
  }
}