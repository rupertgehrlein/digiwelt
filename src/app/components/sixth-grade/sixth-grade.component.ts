import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-sixth-grade',
  templateUrl: './sixth-grade.component.html',
  styleUrl: './sixth-grade.component.scss'
})
export class SixthGradeComponent {
  @ViewChild('commentModal') commentModal: ElementRef;
  supabase: SupabaseClient;
  contents: any[] = [];
  favoriteContentIds = [];
  gradeLevel = 'sixth';
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
    this.changeForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
    });

    await this.fetchFavorites();
    await this.fetchContents();
    this.isAdmin = await this.supabaseFactory.isAdmin();
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

  /* async getFavourites(): Promise<any>{
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
  } */
}
