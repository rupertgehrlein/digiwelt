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
  selectedGradeLevels: string[] = [];
  selectedTopics: string[] = [];
  selectedAspects: string[] = [];
  gradeLevels = ['5. Klasse', '6. Klasse'];
  topics = ['Computer überall', 'Informationen und Daten', 'Grundlagen der Programmierung', 'Vernetzung'];
  aspects = ['Anwendung', 'Technologie', 'Wirkung'];
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
    });

  }

  //Funktion zum abrufen der Daten, die in der Spalte is_approved = false stehen haben
  async fetchContents(): Promise<void> {
    this.contents = await this.supabaseFactory.fetchAllContents(false, false) || [];
  }

  async fetchRegisteredUsers(): Promise<void> {
    this.unregisteredUsers = await this.supabaseFactory.fetchRegisteredUsers() || [];
  }

  //Funktion zum Aufruf der entsprechenden Datei
  async downloadFile(filePath: string): Promise<void> {
    const signedUrl = await this.supabaseFactory.generateSignedUrl(filePath);
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
    await this.supabaseFactory.setApproved(id);
    this.fetchContents();
  }

  //Funktion, die den Wert für is_disapproved des entsprechenden Eintrags auf true setzt -> wird dann Ersteller wieder angezeigt
  async setDisapproved(): Promise<void> {

    let commentString: string = '';
    commentString = this.disapproveForm.value.disapprovedReason.concat(' ', this.disapproveForm.value.adminComment);

    await this.supabaseFactory.setDisapproved(commentString, this.currentId);

    this.disapproveForm.reset();
    this.modalInstance.hide();

    location.reload()
  }

  async createContentForm(id): Promise<void> {
    this.saveCurrentId(id);
    
    var data = await this.supabaseFactory.getContentsByID(this.currentId);
    
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

  async promoteToAdmin() {
    const email = this.adminForm.value.email as string;
    await this.supabaseFactory.promoteToAdmin(email);
  }

  async changeUserMail(){
    const oldEmail = this.userForm.value.oldEmail;
    const newEmail = this.userForm.value.newEmail;
    await this.supabaseFactory.changeUserMail(oldEmail, newEmail);
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
