import { Component, OnInit } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
@Component({
  selector: 'app-fifth-grade',
  templateUrl: './fifth-grade.component.html',
  styleUrl: './fifth-grade.component.scss'
})
export class FifthGradeComponent implements OnInit {
  supabase: SupabaseClient;
  contents: any[] = [];
  favoriteContentIds = [];
  gradeLevel = 'fifth';

  constructor(private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient(); }

  async ngOnInit() {
    await this.fetchFavorites();
    await this.fetchContents();
  }

  //Funktion zum Laden der Inhalte
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

  async fetchFavorites(): Promise<void> {
    try {
      this.favoriteContentIds = await this.supabaseFactory.getFavorites();
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }

  //Funktion zur Generierung von gesicherten Download-URLs
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

  //Funktion für den File Download
  async downloadFile(filePath: string): Promise<void> {
    const signedUrl = await this.generateSignedUrl(filePath);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      alert('Error generating download link.');
    }
  }

  isFavorite(contentId): boolean {
    return this.favoriteContentIds.includes(contentId);
  }

  async toggleFavorite(contentId) {
    if (this.isFavorite(contentId)) {
      await this.supabaseFactory.removeFavorite(contentId);
      this.favoriteContentIds = this.favoriteContentIds.filter(id => id !== contentId);
    } else {
      await this.supabaseFactory.addFavorite(contentId);
      this.favoriteContentIds.push(contentId);
    }
  }
}
