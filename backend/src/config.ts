import * as dotenv from 'dotenv';
import * as path from 'path';

// Solo cargar .env si no estamos en producción con PM2
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '..', '.env'),
  });
}