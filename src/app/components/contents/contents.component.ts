import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  contents: any[] = [];
  favoriteContentIds = [];
  changeForm: FormGroup;
  isAdmin = false;
  currentId;
  private modalInstance: bootstrap.Modal;

  constructor(private formBuilder: FormBuilder, private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient() }

  ngAfterViewInit(): void {
    const modalElement = this.uploadModal.nativeElement;
    this.modalInstance = new bootstrap.Modal(modalElement);
    //modalInstance.show();
  }

  async ngOnInit() {
    this.uploadForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
      commitment: [false, Validators.requiredTrue]
    });

    // Debugging: Log form state changes
    this.uploadForm.valueChanges.subscribe(formState => {
      console.log('Form state changed:', formState);
    });

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

  //Check ob Dateityp passt
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      console.log(fileType);
      // windows zeigt mir an, dass die Dateien .zip files sind, aber anscheinend sind sie bei mir x-zip. Möglicherweise, müssen in Zukunft eventuell noch andere zip MIME zip typen hinzugefügt werden
      const allowedTypes = ['application/pdf', 'application/zip','application/x-zip-compressed' ,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(fileType)) {
        alert('Bitte laden Sie nur .pdf, .zip, .doc oder .docx Dateien hoch.');
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
          is_disapproved: false,
          pdf_file_url: pdfFileUrl,
          file_format: this.selectedFile.type,
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
  //Funktion zum Laden der Inhalte
  async fetchContents(): Promise<void> {
    const { data, error } = await this.supabase
      .from('contents')
      .select('*')
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

