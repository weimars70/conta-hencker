import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY') || this.configService.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async select(table: string, columns = '*', filters?: any) {
    let query = this.supabase.from(table).select(columns);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          query = query.eq(key, filters[key]);
        }
      });
    }
    
    return query;
  }

  async insert(table: string, data: any) {
    return this.supabase.from(table).insert(data);
  }

  async update(table: string, data: any, filters: any) {
    let query = this.supabase.from(table).update(data);
    
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });
    
    return query;
  }

  async delete(table: string, filters: any) {
    let query = this.supabase.from(table).delete();
    
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });
    
    return query;
  }
}