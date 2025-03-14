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
@ViewChild('changeModal') changeModal: ElementRef;

  supabase: SupabaseClient;
  rejectedContents: any[] = [];
  currentUser: any;
  uploadForm: FormGroup;
  changeForm: FormGroup;
  private modalInstance: bootstrap.Modal;
  currentId;
  selectedFile;
  fileName;
  favoriteContents: any[] = [];
  ownContents: any[] = [];
  selectedGradeLevels: string[] = [];
  selectedTopics: string[] = [];
  selectedAspects: string[] = [];
  gradeLevels = ['5. Klasse', '6. Klasse'];
  topics = ['Computer überall', 'Informationen und Daten', 'Grundlagen der Programmierung', 'Vernetzung'];
  aspects = ['Anwendungsperspektive', 'Technologieperspektive', 'Gesellschaftlich-kulturelle-perspektive'];

  constructor(private formBuilder: FormBuilder, private supabaseFactory: SupabaseFactoryService) {
    this.supabase = supabaseFactory.getClient();
  }

  ngAfterViewInit(): void {
    const modalElement = this.changeModal.nativeElement;
    this.modalInstance = new bootstrap.Modal(modalElement);
  }

  async ngOnInit() {

    this.uploadForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
    });

    this.changeForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
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
    this.rejectedContents = await this.supabaseFactory.getUserContentByApprovement(false, true, userId) || [];
  }

  async fetchFavoriteContents() {
    try {
      this.favoriteContents = await this.supabaseFactory.getFavoriteDetails();
      console.log(this.favoriteContents);
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
    
    this.selectedGradeLevels = [];
    this.selectedTopics = [];
    this.selectedAspects = [];

    const heading = data[0].heading;
    const description = data[0].description;

    this.gradeLevels.forEach(grade => { 
      if(data[0].grade_level.includes(grade)){
        document.getElementById(grade).click();
      }
    });

    this.topics.forEach(topic => { 
      if(data[0].topic.includes(topic)){
        document.getElementById(topic).click();
      }
    });

    this.aspects.forEach(aspect => { 
      if(data[0].perspective.includes(aspect)){
        document.getElementById(aspect).click();
      }
    });

    this.changeForm = this.formBuilder.group({
      heading: [heading, Validators.required],
      description: [description, Validators.required],
    });
  }

  async changeContent(): Promise<void> {

    const heading = this.changeForm.value.heading;
    const description = this.changeForm.value.description;      
    const gradeLevel = this.selectedGradeLevels;
    const topic = this.selectedTopics;
    const perspective = this.selectedAspects;
    const id = this.currentId;

    await this.supabaseFactory.updateContent(heading, description, gradeLevel, topic, perspective, id)

    this.changeForm.reset();
    this.modalInstance.hide();
    location.reload()
  }

  // Änderungen für Klassenstufen speichern
  onGradeChange(event: any): void {
    const selectedGrade = event.target.value;
    if (event.target.checked) {
      this.selectedGradeLevels.push(selectedGrade);
    } else {
      const index = this.selectedGradeLevels.indexOf(selectedGrade);
      if (index > -1) {
        this.selectedGradeLevels.splice(index, 1);
      }
    }
    this.isValidSelection();
  }
  
  // Änderungen für Themen speichern
  onTopicChange(event: any): void {
    const selectedTopic = event.target.value;
    if (event.target.checked) {
      this.selectedTopics.push(selectedTopic);
    } else {
      const index = this.selectedTopics.indexOf(selectedTopic);
      if (index > -1) {
        this.selectedTopics.splice(index, 1);
      }
    }
    this.isValidSelection();
  }
  
  // Änderungen für Perspektiven speichern
  onAspectChange(event: any): void {
    const selectedAspect = event.target.value;
    if (event.target.checked) {
      this.selectedAspects.push(selectedAspect);
    } else {
      const index = this.selectedAspects.indexOf(selectedAspect);
      if (index > -1) {
        this.selectedAspects.splice(index, 1);
      }
    }
    this.isValidSelection();
  }
  
  // Validierung für mindestens eine Auswahl pro Kategorie
  isValidSelection(): boolean {
    return this.selectedGradeLevels.length > 0 &&
      this.selectedTopics.length > 0 &&
      this.selectedAspects.length > 0;
  }

}



