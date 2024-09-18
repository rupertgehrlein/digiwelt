import { Component, ElementRef, ViewChild } from '@angular/core';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  supabase: SupabaseClient;
  rejectedContents: any[] = [];
  currentUser: any;
  uploadForm: FormGroup;
  changeForm: FormGroup;
  private modalInstance: bootstrap.Modal;
  checkAnwendungBool: boolean = false;
  checkTechnologieBool: boolean = false;
  checkWirkungBool: boolean = false;
  currentId;
  selectedFile;
  fileName;
  favoriteContents: any[] = [];
  ownContents: any[] = [];

  constructor(private formBuilder: FormBuilder, private supabaseFactory: SupabaseFactoryService) {
    this.supabase = supabaseFactory.getClient();
  }

  async ngOnInit() {
    this.changeForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
    });

    this.uploadForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
    });

    await this.getCurrentUserAndFetchContents();
    await this.fetchFavoriteContents();
    await this.fetchOwnContents();
  }

  async getCurrentUserAndFetchContents() {
    this.currentUser = await this.supabase.auth.getUser();

    if (this.currentUser) {
      const userId = this.currentUser.data.user.id;
      await this.fetchRejectedContents(userId);
    } else {
      console.error('Current user is undefined');
    }
  }

  async fetchRejectedContents(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('contents')
      .select('*')
      .eq('is_disapproved', true)
      .eq('creator_id', userId);

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }

    this.rejectedContents = data || [];
  }

  async fetchFavoriteContents() {
    try {
      this.favoriteContents = await this.supabaseFactory.getFavoriteDetails();
    } catch (error) {
      console.error('Error fetching favorite contents:', error);
    }
  }

  isFavorite(contentId: string): boolean {
    return this.favoriteContents.some(content => content.id === contentId);
  }

  async toggleFavorite(contentId: string) {
    if (this.isFavorite(contentId)) {
      await this.supabaseFactory.removeFavorite(contentId);
      this.favoriteContents = this.favoriteContents.filter(content => content.id !== contentId);
    } else {
      await this.supabaseFactory.addFavorite(contentId);
      const favoriteDetails = await this.supabaseFactory.getContentDetails(contentId);
      if (favoriteDetails) {
        this.favoriteContents.push(favoriteDetails);
      }
    }
  }

  async fetchOwnContents() {
    try {
      this.ownContents = await this.supabaseFactory.getOwnContentDetails();
    } catch (error) {
      console.error('Error fetching own contents:', error);
    }
    console.log(this.ownContents);
  }

  //Check ob Dateityp passt
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(fileType)) {
        alert('Bitte laden Sie nur .pdf, .doc oder .docx Dateien hoch.');
        return;
      }
      this.selectedFile = file;
    }
  }

  saveCurrentId(id) {
    this.currentId = id;
  }

  async saveChanges() {
    //Datenbank-Eintrag mit allen nötigen Spalten
    const { data: contentData, error: contentError } = await this.supabase
      .from('contents')
      .update([
        {
          heading: this.uploadForm.value.heading,
          description: this.uploadForm.value.description,
          grade_level: this.uploadForm.value.gradeLevel,/*
          creator_id: this.currentUser.data.user.id, */
          is_approved: false,
          is_disapproved: false,/*
          pdf_file_url: pdfFileUrl, */
          topic: this.uploadForm.value.topic,
        },
      ]);

    if (contentError) {
      console.error('Error updating content:', contentError);
      return;
    }

    //Alles wieder auf Anfang und Modal wird geschlossen
    this.uploadForm.reset();
    this.selectedFile = null;
    this.modalInstance.hide();

    location.reload()

  }

  async deleteContent(id) {
    await this.getFileName(id);

    await this.deleteFile(this.fileName);

    const { error } = await this.supabase
      .from('contents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error updating content approval status:', error);
      return;
    }

    this.fetchRejectedContents(this.currentUser.data.user.id);

  }

  async getFileName(id) {
    const { data, error } = await this.supabase
      .from('contents')
      .select('pdf_file_url')
      .eq('id', id);

    if (error) {
      console.error('Error getting file:', error);
      return;
    }

    if (data && data.length > 0) {
      this.fileName = data[0].pdf_file_url;
    } else {
      console.warn('No file found with the given ID.');
      this.fileName = null;
    }
  }

  async deleteFile(fileName) {
    const { error } = await this.supabase
      .storage
      .from('pdf_uploads')
      .remove([fileName])

    if (error) {
      console.error('Error updating content approval status:', error);
      return;
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

  /// Checkbox Funktions
  AnwendungChange(event: any){
    if(event.target.checked){
      this.checkAnwendungBool = true;
    }else{
      this.checkAnwendungBool = false;
    }
  }

  TechnologieChange(event: any){
    if(event.target.checked){
      this.checkTechnologieBool= true;
    }else{
      this.checkTechnologieBool = false;
    }
  }

  WirkungChange(event: any){
    if(event.target.checked){
      this.checkWirkungBool= true;
    }else{
      this.checkWirkungBool = false;
    }
  }

  async changeContent(): Promise<void>{

    const { error } = await this.supabase
      .from('contents')
      .update({
        heading: this.changeForm.value.heading,
        description: this.changeForm.value.description,
        grade_level: this.changeForm.value.gradeLevel,
        topic: this.changeForm.value.topic,
        aspectAnwendung: this.checkAnwendungBool,
        aspectTechnologie: this.checkTechnologieBool,
        aspectWirkung: this.checkWirkungBool,
       })
      .eq('id', this.currentId)

      console.log(this.currentId);

    if (error) {
      console.error('Error updating content approval status:', error);
      return;
    }

    this.changeForm.reset();
    this.modalInstance.hide();

    this.checkAnwendungBool = false;
    this.checkTechnologieBool = false;
    this.checkWirkungBool = false;

    location.reload()
  }

}



