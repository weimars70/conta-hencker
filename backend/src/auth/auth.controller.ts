import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    console.log('🌐 LOGIN CONTROLLER - Petición recibida:', {
      email: loginDto.email,
      password_length: loginDto.password?.length,
      tiene_password: !!loginDto.password
    });

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      console.log('❌ LOGIN CONTROLLER - Validación falló, credenciales inválidas');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('✅ LOGIN CONTROLLER - Validación exitosa, generando token...');
    return this.authService.login(user);
  }
}