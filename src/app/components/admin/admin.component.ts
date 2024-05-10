import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  @ViewChild('commentModal') commentModal: ElementRef;

  supabase: SupabaseClient;
  contents: any[] = [];
  uploadForm: FormGroup;
  private modalInstance: bootstrap.Modal;
  currentId;

  constructor(private formBuilder: FormBuilder,
    private supabaseFactory: SupabaseFactoryService,
    private cdr: ChangeDetectorRef) { this.supabase = supabaseFactory.getClient(); }

  ngAfterViewInit(): void {
    const modalElement = this.commentModal.nativeElement;
    this.modalInstance = new bootstrap.Modal(modalElement);
  }


  ngOnInit() {
    this.fetchContents(); //ruft beim laden der Seite die Funktion auf

    this.uploadForm = this.formBuilder.group({
      adminComment: ['', Validators.required],
    });
  }

  //Funktion zum abrufen der Daten, die in der Spalte is_approved = false stehen haben
  async fetchContents(): Promise<void> {
    console.log('Start fetchContents()');

    const { data, error } = await this.supabase
      .from('contents')
      .select('*')
      .eq('is_approved', false)
      .eq('is_disapproved', false)

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

  saveCurrentId(id) {
    this.currentId = id;
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

  //Funktion, die den Wert für is_disapproved des entsprechenden Eintrags auf true setzt -> wird dann Ersteller wieder angezeigt
  async setDisapproved(): Promise<void>{
    const { error } = await this.supabase
      .from('contents')
      .update({ is_disapproved: true, admin_comment: this.uploadForm.value.adminComment })
      .eq('id', this.currentId)

    if (error) {
      console.error('Error updating content approval status:', error);
      return;
    }
    //ab hier scheint es noch einen Bug zu geben, den ich aber nicht finde. Die Contents laden sich nicht einfach nicht neu.
    //Wenn man woanders drückt lädt es aber neu. I have no fucking idea was ich da noch machen kann
    this.contents = this.contents.filter(item => item.id !== this.currentId);

    this.fetchContents();

    this.uploadForm.reset();
    this.modalInstance.hide();
  }
}
