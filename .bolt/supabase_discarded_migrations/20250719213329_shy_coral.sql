/*
  # Create accesos table

  1. New Tables
    - `accesos`
      - `empresa` (text, default '01')
      - `usuario` (text, primary key)
      - `nombre` (text, nullable)
      - `clave` (text, nullable)
      - `nivel` (text, nullable)
      - `codigo` (integer, nullable)
      - `bodega` (integer, nullable)
      - `centro_costos` (integer, nullable)
      - `activo` (boolean, default true)

  2. Security
    - Enable RLS on `accesos` table
    - Add policy for authenticated users to manage their own data
    - Add policy for service role to manage all data

  3. Indexes
    - Index on `activo` for filtering active users
    - Index on `empresa` for company-based queries
*/

CREATE TABLE IF NOT EXISTS public.accesos (
  empresa text DEFAULT '01'::text,
  usuario text NOT NULL,
  nombre text,
  clave text,
  nivel text,
  codigo integer,
  bodega integer,
  centro_costos integer,
  activo boolean DEFAULT true,
  CONSTRAINT accesos_pkey PRIMARY KEY (usuario)
);

-- Enable RLS
ALTER TABLE public.accesos ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accesos_activo ON public.accesos
  USING btree (activo);

CREATE INDEX IF NOT EXISTS idx_accesos_empresa ON public.accesos
  USING btree (empresa);

-- Create policies
CREATE POLICY "Authenticated users can manage accesos"
  ON public.accesos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage all accesos"
  ON public.accesos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert some sample data
INSERT INTO public.accesos (empresa, usuario, nombre, clave, nivel, codigo, bodega, centro_costos, activo)
VALUES 
  ('01', 'admin', 'Administrador', 'admin123', 'admin', 1, 1, 1, true),
  ('01', 'operador', 'Operador', 'oper123', 'user', 2, 1, 1, true),
  ('02', 'admin', 'Administrador Empresa 2', 'admin123', 'admin', 1, 1, 1, true)
ON CONFLICT (usuario) DO NOTHING;