import { Component } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';

@Component({
  selector: 'app-sixth-grade',
  templateUrl: './sixth-grade.component.html',
  styleUrl: './sixth-grade.component.scss'
})
export class SixthGradeComponent {
  supabase: SupabaseClient;
  contents: any[] = [];
  gradeLevel = 'sixth';

  constructor(private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient(); }

  ngOnInit() {
    this.fetchContents();
  }

  async fetchContents(): Promise<void> {
    const { data, error } = await this.supabase
      .from('contents')
      .select('*')
      .eq('grade_level', this.gradeLevel)
      .eq('is_approved', true)

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

}
