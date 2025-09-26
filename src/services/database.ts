import { createClient } from '@supabase/supabase-js';

// Database configuration
const supabaseUrl = 'https://database.altan.ai';
const supabaseKey = 'tenant_a15402df_e4e2_4656_951a_47bc1c4b3493';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export class DatabaseService {
  // Generic query methods
  static async select(table: string, columns = '*', filters?: Record<string, any>) {
    let query = supabase.from(table).select(columns);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    if (error) throw new Error(`Database query failed: ${error.message}`);
    return data;
  }

  static async insert(table: string, data: Record<string, any>) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(`Database insert failed: ${error.message}`);
    return result;
  }

  static async update(table: string, id: string, data: Record<string, any>) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Database update failed: ${error.message}`);
    return result;
  }

  static async delete(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Database delete failed: ${error.message}`);
    return true;
  }

  static async findById(table: string, id: string) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database query failed: ${error.message}`);
    }
    return data;
  }

  static async findOne(table: string, filters: Record<string, any>) {
    let query = supabase.from(table).select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database query failed: ${error.message}`);
    }
    return data;
  }

  static async count(table: string, filters?: Record<string, any>) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { count, error } = await query;
    if (error) throw new Error(`Database count failed: ${error.message}`);
    return count || 0;
  }
}