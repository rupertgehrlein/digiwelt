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
    this.fetchContents(); //ruft beim laden der Seite die Funktion auf
  }//test test

  //Funktion zum abrufen der Daten, die in der Spalte is_approved = false stehen haben
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

  // Funktion zur signierten URL Erstellung für den sicheren Datei-Download
  async generateSignedUrl(filePath: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .storage
      .from('pdf_uploads')
      .createSignedUrl(filePath, 3600); // Link ist für 1 Stunde gültig, eigentlich in dem SetUp aber egal

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data?.signedUrl;
  }

  //Funktion zum Aufruf der entsprechenden Datei
  async downloadFile(filePath: string): Promise<void> {
    const signedUrl = await this.generateSignedUrl(filePath);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      alert('Error generating download link.');
    }
  }

  //Funktion, die den Wert für is_approved des entsprechenden Eintrags auf true setzt -> dann erst für alle User verfügbar
  async setApproved(id): Promise<void> {
    const { error } = await this.supabase
      .from('contents')
      .update({ is_approved: true })
      .eq('id', id)

    if (error) {
      console.error('Error updating content approval status:', error);
      return;
    }

    //Seite wird hiermit automatisch "neu geladen"
    this.fetchContents();
  }

  //Funktion zum übergeben der Daten an neue Tabelle
  async setDisapproved(id): Promise<void>{

    const { data, error } = await this.supabase
      .from('dismissed_contents')
      .insert({id: '2', heading: "test", description: "test", grade_level:"fifth", creator_id: '1', is_approved: false, pdf_file_url: "www", topic: "topic", admin_comment: "comment"  })
      .select()
    //.from('contents')
      //.select()
      //.eq('id', id)

    //console.log(data[0]);
    
    //hier fehlt noch die übergabe an die neue Datenbank

    if(error) {
      console.error('Error updating content approval status:', error);
      return;
    }
    //this.deleteContent(id)
  }
  

  //Funktion zum löschen der entsprechenden Einträge aus der "contents" liste
  async deleteContent(id): Promise<void>{

    //hierhin muss dann noch der Funktionsaufruf für unten

    const { error } = await this.supabase
      .from('contents')
      .delete()
      .eq('id', id)

    if(error) {
      console.error('Error updating content approval status:', error);
      return;
    }
//Seite wird hiermit automatisch "neu geladen"
    this.fetchContents();
  }
}
