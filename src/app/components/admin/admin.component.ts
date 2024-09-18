import { Component, ElementRef, ViewChild } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  @ViewChild('commentModal') commentModal: ElementRef;

  supabase: SupabaseClient;
  contents: any[] = [];
  unregisteredUsers: any[] = []
  disapproveForm: FormGroup;
  changeForm: FormGroup;
  private modalInstance: bootstrap.Modal;
  currentId;
  checkAnwendungBool: boolean = false;
  checkTechnologieBool: boolean = false;
  checkWirkungBool: boolean = false;
  reasons: any = ['Grund 1', 'Grund 2', 'Grund 3', 'Grund 4', 'Sonstiges']
  showCommentField: boolean = false;
  adminForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required]]
  });
  userForm: FormGroup = this.formBuilder.group({
    oldEmail: ['', [Validators.required]],
    newEmail: ['', [Validators.required]]
  });
  loading = false;

  constructor(private formBuilder: FormBuilder,
    private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient(); }

  ngAfterViewInit(): void {
    const modalElement = this.commentModal.nativeElement;
    this.modalInstance = new bootstrap.Modal(modalElement);
  }

  ngOnInit() {
    this.fetchContents(); //ruft beim laden der Seite die Funktion auf
    this.fetchRegisteredUsers();

    this.disapproveForm = this.formBuilder.group({
      adminComment: [''],
      disapprovedReason: ['', [Validators.required]],
    });

    // Subscribe to changes in the disapprovedReason form control
    this.disapproveForm.get('disapprovedReason').valueChanges.subscribe(reason => {
      this.showCommentField = reason === 'Sonstiges';
    });

    this.changeForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
    });

  }

  //Funktion zum abrufen der Daten, die in der Spalte is_approved = false stehen haben
  async fetchContents(): Promise<void> {
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

  async fetchRegisteredUsers(): Promise<void> {
    const { data, error } = await this.supabase
      .from('unregistered_users')
      .select('*')

    if (error) {
      console.error('Fetching unregistered Users failed: ', error);
      return;
    }

    this.unregisteredUsers = data || [];
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
  async setDisapproved(): Promise<void> {

    let commentString: string = '';
    commentString = this.disapproveForm.value.disapprovedReason.concat(' ', this.disapproveForm.value.adminComment);

    const { error } = await this.supabase
      .from('contents')
      .update({ is_disapproved: true, admin_comment: commentString })
      .eq('id', this.currentId)
      console.log(this.currentId);

    if (error) {
      console.error('Error updating content approval status:', error);
      return;
    }

    this.disapproveForm.reset();
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

  async promoteToAdmin() {
    const email = this.adminForm.value.email as string;
    await this.supabaseFactory.promoteToAdmin(email);
  }

  async changeUserMail(){
    const oldEmail = this.userForm.value.oldEmail;
    const newEmail = this.userForm.value.newEmail;
    await this.supabaseFactory.changeUserMail(oldEmail, newEmail);
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

  changeReason(event) {
    const selectedReason = event.target.value;
    this.showCommentField = selectedReason === 'Sonstiges';
    this.disapprovedReason.setValue(selectedReason);
  }

  get disapprovedReason() {
    return this.disapproveForm.get('disapprovedReason');
  }


  //Funktionen zum Annehmen und Ablehnen von neuen Nutzern
  async acceptNewUser(userMail) {
    await this.supabaseFactory.newUserAccepted(userMail);
    this.fetchRegisteredUsers();
  }

  async declineNewUser(email) {
    await this.supabaseFactory.removeUnregisteredUser(email);
    this.fetchRegisteredUsers();
  }
}
