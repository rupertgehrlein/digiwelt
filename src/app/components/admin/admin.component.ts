import { Component } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  supabase: SupabaseClient;
  contents: any[] = [];

  constructor(private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient(); }

  ngOnInit() {
    this.fetchContents();
  }

  async fetchContents(): Promise<void> {
    const { data, error } = await this.supabase
      .from('contents')
      .select('*')
      .eq('is_approved', false)

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }

    this.contents = data || [];
  }

  async generateSignedUrl(filePath: string): Promise<string | null> {
    const { data, error } = await this.supabase
       .storage
       .from('pdf_uploads')
       .createSignedUrl(filePath, 3600); // Adjust the expiration time as needed

    if (error) {
       console.error('Error generating signed URL:', error);
       return null;
    }

    return data?.signedUrl;
   }

   async downloadFile(filePath: string): Promise<void> {
    const signedUrl = await this.generateSignedUrl(filePath);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
       alert('Error generating download link.');
    }
   }

  async setApproved(id): Promise<void>{
    const { error } = await this.supabase
      .from('contents')
      .update({ is_approved: true })
      .eq('id', id)

    if(error) {
      console.error('Error updating content approval status:', error);
      return;
    }

    this.fetchContents();
  }

  async setDisapproved(id): Promise<void>{
    const { error } = await this.supabase
      .from('contents')
      .delete()
      .eq('id', id)
      
    if(error) {
      console.error('Error updating content approval status:', error);
      return;
      }
  }
}
