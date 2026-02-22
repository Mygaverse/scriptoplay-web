
import { createClient } from '../lib/supabase/client';

const supabase = createClient();

export interface Asset {
  id: string;
  userId: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  name: string;
  prompt?: string;
  createdAt?: any;
  metadata?: any;
  projectId?: string;
}

export const assetService = {
  /**
   * Saves metadata for a new asset to 'assets' table
   */
  async saveAsset(userId: string, assetData: Omit<Asset, 'id' | 'userId' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        type: assetData.type,
        name: assetData.name,
        url: assetData.url,
        prompt: assetData.prompt,
        metadata: assetData.metadata || {},
        project_id: assetData.projectId // Optional
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      ...assetData,
      userId,
      createdAt: { seconds: new Date(data.created_at).getTime() / 1000 } // Mock Firestore TS
    };
  },

  /**
   * Gets all assets for a user
   */
  async getUserAssets(userId: string, type?: 'image' | 'audio' | 'video') {
    let query = supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Asset Fetch Error:", error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      url: row.url,
      name: row.name,
      prompt: row.prompt,
      metadata: row.metadata,
      projectId: row.project_id,
      createdAt: { seconds: new Date(row.created_at).getTime() / 1000 }
    }));
  },

  /**
   * Deletes an asset
   */
  async deleteAsset(userId: string, assetId: string) {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId); // Security check

    if (error) throw error;
  }
};
