import { Component, ElementRef, ViewChild } from '@angular/core';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild('changeModal') changeModal: ElementRef;
  supabase: SupabaseClient;
  contents: any[] = [];
  currentUser: any;
  uploadForm: FormGroup;
  private modalInstance: bootstrap.Modal;
  currentId;
  selectedFile;
  fileName;

  constructor(private formBuilder: FormBuilder, private supabaseFactory: SupabaseFactoryService) {
    this.supabase = supabaseFactory.getClient();
  }

  async ngOnInit() {
    await this.getCurrentUserAndFetchContents(); // Wait for currentUser to be fetched before fetching contents

    this.uploadForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
    });
  }

  async getCurrentUserAndFetchContents() {
    this.currentUser = await this.supabase.auth.getUser();

    if (this.currentUser) {
      const userId = this.currentUser.data.user.id;
      await this.fetchContents(userId);
    } else {
      console.error('Current user is undefined');
    }
  }

  async fetchContents(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('contents')
      .select('*')
      .eq('is_disapproved', true)
      .eq('creator_id', userId);

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }

    this.contents = data || [];
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
    //Check ob Datei existiert
    /* if (!this.uploadForm.valid || !this.selectedFile) {
      alert('Es wurde keine Datei ausgewählt.')
      return;
    } */

    //Setzt timestamp an Dateiname um Dopplungen zu vermeiden
    /* const timestamp = new Date().getTime();
    const uniqueFileName = `${this.selectedFile.name.replace(/\.[^/.]+$/, "")}_${timestamp}${this.selectedFile.name.split('.').pop()}`;

    const formData = new FormData();
    formData.append('file', this.selectedFile, uniqueFileName);
    formData.append('path', uniqueFileName);

    //Packt Datei in den Backend Storage Bucket
    const { data, error } = await this.supabase
      .storage
      .from('pdf_uploads')
      .upload(uniqueFileName, formData);

    if (error) {
      console.error('Error uploading file:', error);
      return;
    }

    const pdfFileUrl = data?.path; */

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

    this.fetchContents(this.currentUser.data.user.id);

  }

  async getFileName(id) {
    const { data, error } = await this.supabase
      .from('contents')
      .select('pdf_file_url')
      .eq('id', id)

    if (error) {
      console.error('Error getting file:', error);
      return;
    }

    this.fileName = data;
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
}

