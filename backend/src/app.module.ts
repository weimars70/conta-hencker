import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AccesosModule } from './accesos/accesos.module';
import { GenericCaptureModule } from './generic-capture/generic-capture.module';
import { PdfModule } from './pdf/pdf.module';
import { EmpresasModule } from './empresas/empresas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    DatabaseModule,
    AuthModule,
    UsuariosModule,
    AccesosModule,
    GenericCaptureModule,
    PdfModule,
    EmpresasModule,
  ],
})
export class AppModule {}