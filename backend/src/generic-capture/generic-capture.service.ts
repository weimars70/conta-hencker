import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GenericCaptureService {
  constructor(private readonly dbClient: DatabaseService) {}

  async create(tabla: string, empresa: string, createGenericRecordDto: any) {
    const { tabla: _, ...data } = createGenericRecordDto; // Excluir 'tabla' de los datos
    if (!tabla) {
      throw new Error('Table name is required');
    }
    return await this.dbClient.insert(tabla, { ...data, empresa });
  }

  async findAll(tabla: string, empresa: string, filter?: string) {
    if (!tabla) {
      throw new Error('Table name is required');
    }
    return await this.dbClient.findAll(tabla, { empresa, filter });
  }

  async findOne(tabla: string, empresa: string, codigo: number) {
    if (!tabla) {
      throw new Error('Table name is required');
    }
    // const identifierField = this.getIdentifierField(tabla);
    const record = await this.dbClient.findOne(tabla, { codigo, empresa });
    if (!record) {
      throw new NotFoundException(`Record with codigo ${codigo} not found in table ${tabla} for company ${empresa}`);
    }
    return record;
  }

  async update(tabla: string, empresa: string, codigo: number, updateGenericRecordDto: any) {
    const { tabla: _, ...data } = updateGenericRecordDto; // Excluir 'tabla' de los datos
    if (!tabla) {
      throw new Error('Table name is required');
    }
    // const identifierField = this.getIdentifierField(tabla);
    const updatedRecord = await this.dbClient.update(tabla, { codigo, empresa }, data);
    if (!updatedRecord) {
      throw new NotFoundException(`Record with codigo ${codigo} not found in table ${tabla} for company ${empresa}`);
    }
    return updatedRecord;
  }

  async remove(tabla: string, empresa: string, codigo: number) {
    if (!tabla) {
      throw new Error('Table name is required');
    }
    // const identifierField = this.getIdentifierField(tabla);
    const deletedRecord = await this.dbClient.remove(tabla, { codigo, empresa });
    if (!deletedRecord) {
      throw new NotFoundException(`Record with codigo ${codigo} not found in table ${tabla} for company ${empresa}`);
    }
    return deletedRecord;
  }
}