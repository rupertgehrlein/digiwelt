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

  async getFavourites(): Promise<any>{
    const { data, error } = await this.supabase
    .from('users')
    .select('favourites')
    .eq('id', (await this.supabase.auth.getUser()).data.user.id);

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }

    var output = data[0].favourites;
    if (output == null){
      return [];
    }
    else{
      return output;
    }

  }

  async addFavourite(id: any): Promise<void>{
    var favos = await this.getFavourites();
    console.log("1:", favos);
    favos.push(id);
    console.log("2:",favos);
    this.uploadFavourites(favos);
  }

  async removeFavourite(id:any): Promise<void>{
  var oldFavos = await this.getFavourites();
  var newFavos = oldFavos.filter((e,i) => e != id);
  this.uploadFavourites(newFavos);
  }

  async uploadFavourites(favos: any): Promise<void> {
    console.log(favos);
    const {error} = await this.supabase
    .from('users')
    .update({favourites: favos})
    .eq('id', (await this.supabase.auth.getUser()).data.user.id);

    if (error) {
      console.error(error);
     return;
   }
  }
}
