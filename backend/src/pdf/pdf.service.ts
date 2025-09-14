import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  generateReport() {
    return { message: 'PDF generation not implemented yet' };
  }
}