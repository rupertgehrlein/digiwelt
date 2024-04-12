import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { SupabaseService } from '../../services/supabase.service';
import * as bootstrap from 'bootstrap';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-contents',
  templateUrl: './contents.component.html',
  styleUrls: ['./contents.component.scss']
})
export class ContentsComponent implements OnInit {
  @ViewChild('uploadModal') uploadModal: ElementRef;

  supabase: SupabaseClient;
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  private modalInstance: bootstrap.Modal;

  constructor(private formBuilder: FormBuilder, private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient() }

  ngAfterViewInit(): void {
    const modalElement = this.uploadModal.nativeElement;
    this.modalInstance = new bootstrap.Modal(modalElement);
    //modalInstance.show();
  }

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
    });
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


  //Funktion für den Upload neuer Inhalte
  async onSubmit(): Promise<void> {

    //Check ob Datei existiert
    if (!this.uploadForm.valid || !this.selectedFile) {
      alert('Es wurde keine Datei ausgewählt.')
      return;
    }

    //Setzt timestamp an Dateiname um Dopplungen zu vermeiden
    const timestamp = new Date().getTime();
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

    const pdfFileUrl = data?.path;

    //Datenbank-Eintrag mit allen nötigen Spalten
    const { data: contentData, error: contentError } = await this.supabase
      .from('contents')
      .insert([
        {
          heading: this.uploadForm.value.heading,
          description: this.uploadForm.value.description,
          grade_level: this.uploadForm.value.gradeLevel,
          creator_id: (await this.supabase.auth.getUser()).data.user.id,
          is_approved: false,
          pdf_file_url: pdfFileUrl,
          topic: this.uploadForm.value.topic,
        },
      ]);

    if (contentError) {
      console.error('Error inserting content:', contentError);
      return;
    }

    //Alles wieder auf Anfang und Modal wird geschlossen
    this.uploadForm.reset();
    this.selectedFile = null;
    this.modalInstance.hide();
  }
}

