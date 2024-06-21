import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-fifth-grade',
  templateUrl: './fifth-grade.component.html',
  styleUrl: './fifth-grade.component.scss'
})
export class FifthGradeComponent implements OnInit {
  @ViewChild('commentModal') commentModal: ElementRef;
  supabase: SupabaseClient;
  contents: any[] = [];
  favoriteContentIds = [];
  gradeLevel = 'fifth';
  changeForm: FormGroup;
  isAdmin = false;
  currentId;
  private modalInstance: bootstrap.Modal;

  constructor(private formBuilder: FormBuilder, 
    private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient(); }

    ngAfterViewInit(): void {
      const modalElement = this.commentModal.nativeElement;
      this.modalInstance = new bootstrap.Modal(modalElement);
    }

  async ngOnInit() {
    await this.fetchFavorites();
    await this.fetchContents();
    this.isAdmin = await this.supabaseFactory.isAdmin();

    this.changeForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
    });
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

  saveCurrentId(id) {
    this.currentId = id;
  }

  async changeContent(): Promise<void>{
    const { error } = await this.supabase
      .from('contents')
      .update({ 
        heading: this.changeForm.value.heading,
        description: this.changeForm.value.description,
        grade_level: this.changeForm.value.gradeLevel,
        topic: this.changeForm.value.topic,
       })
      .eq('id', this.currentId)

      console.log(this.currentId);

    if (error) {
      console.error('Error updating content approval status:', error);
      return;
    }

    this.changeForm.reset();
    this.modalInstance.hide();

    location.reload()
  }
  async createContentForm(id): Promise<void> {
    this.saveCurrentId(id);

    const { data, error } = await this.supabase
      .from('contents')
      .select('*')
      .eq('id', this.currentId)

      if (error) {
        console.error('Error fetching contents:', error);
        return;
      }

      this.changeForm = this.formBuilder.group({
        heading: [data[0].heading, Validators.required],
        description: [data[0].description, Validators.required],
        gradeLevel: [data[0].grade_level, Validators.required],
        topic: [data[0].topic, Validators.required],
      });
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
