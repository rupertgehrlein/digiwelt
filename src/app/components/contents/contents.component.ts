import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-contents',
  templateUrl: './contents.component.html',
  styleUrls: ['./contents.component.scss'],
})
export class ContentsComponent implements OnInit {
  @ViewChild('uploadModal') uploadModal: ElementRef;

  supabase: SupabaseClient;
  private modalInstance: bootstrap.Modal;
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  fetchedContents: any[] = [];
  filteredContents: any[] = [];
  contentTitles: any[] = [];
  favoriteContentIds = [];
  changeForm: FormGroup;
  isAdmin = false;
  currentId;

  selectedGradeLevels: string[] = [];
  selectedTopics: string[] = [];
  selectedAspects: string[] = [];
  gradeLevels = ['5. Klasse', '6. Klasse'];
  topics = ['Computer überall', 'Informationen und Daten', 'Grundlagen der Programmierung', 'Vernetzung'];
  aspects = ['Anwendungsperspektive', 'Technologieperspektive', 'Gesellschaftlich-kulturelle Perspektive'];

  constructor(private formBuilder: FormBuilder, 
    private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient()}
  
  ngAfterViewInit(): void {
    const modalElement = this.uploadModal.nativeElement;
    this.modalInstance = new bootstrap.Modal(modalElement);
    }

  async ngOnInit() {
    this.uploadForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
      commitment: [false, Validators.requiredTrue]
    });

    this.changeForm = this.formBuilder.group({
      heading: ['', Validators.required],
      description: ['', Validators.required],
    });

    await this.fetchFavorites();
    await this.fetchContents();
    this.isAdmin = await this.supabaseFactory.isAdmin();
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
    console.log(event.target.value);
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

  //Check ob Dateityp passt
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      console.log(fileType);
      // windows zeigt mir an, dass die Dateien .zip files sind, aber anscheinend sind sie bei mir x-zip. Möglicherweise, müssen in Zukunft eventuell noch andere zip MIME zip typen hinzugefügt werden
      const allowedTypes = ['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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

    const heading = this.uploadForm.value.heading;
    const description = this.uploadForm.value.description;
    const gradeLevel = this.selectedGradeLevels;
    const file_format = this.selectedFile.type;
    const topic = this.selectedTopics;
    const perspective = this.selectedAspects;

    await this.supabaseFactory.uploadContent(uniqueFileName, formData, heading, description, gradeLevel, file_format, topic, perspective);

    //Alles wieder auf Anfang und Modal wird geschlossen
    this.uploadForm.reset();
    this.selectedFile = null;
    this.modalInstance.hide();
  }
  //Funktion zum Laden der Inhalte
  async fetchContents(): Promise<void> {

    this.fetchedContents = await this.supabaseFactory.fetchAllContents(true, false) || [];
    this.filteredContents = this.fetchedContents;
  }

  resetContents(){
    this.filteredContents = this.fetchedContents;
  }

  async fetchFavorites(): Promise<void> {
    try {
      this.favoriteContentIds = await this.supabaseFactory.getFavorites();
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }

  //Funktion für den File Download
  async downloadFile(filePath: string): Promise<void> {
    const signedUrl = await this.supabaseFactory.generateSignedUrl(filePath);
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

  //bestimmt repetetiv und sollte in services ausgelagert werden
  async createContentForm(id): Promise<void> {
    this.saveCurrentId(id);

    var data = await this.supabaseFactory.getContentsByID(this.currentId);

    this.selectedGradeLevels = [];
    this.selectedTopics = [];
    this.selectedAspects = [];

    const heading = data[0].heading;
    const description = data[0].description;

    this.gradeLevels.forEach(grade => {
      if (data[0].grade_level.includes(grade)) {
        document.getElementById(grade).click();
      }
    });

    this.topics.forEach(topic => {
      if (data[0].topic.includes(topic)) {
        document.getElementById(topic).click();
      }
    });

    this.aspects.forEach(aspect => {
      if (data[0].perspective.includes(aspect)) {
        document.getElementById(aspect).click();
      }
    });

    this.changeForm = this.formBuilder.group({
      heading: [heading, Validators.required],
      description: [description, Validators.required],
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

  // Filterfunktion für die Inhalte
  filterContent(): void {
    const contents = this.fetchedContents;
    const filteredContents = contents.filter(content => {
      const matchesGradeLevel = this.selectedGradeLevels.length === 0 ||
        this.selectedGradeLevels.every((level: string) => content.grade_level.includes(level)); // "AND" Filter
      //content.grade_level.some((level: string) => this.selectedGradeLevels.includes(level)); "OR" Filter

      const matchesTopic = this.selectedTopics.length === 0 ||
        this.selectedTopics.every((topic: string) => content.topic.includes(topic)); // "AND" Filter
      //content.topic.some((topic: string) => this.selectedTopics.includes(topic)); "OR" Filter

      const matchesAspect = this.selectedAspects.length === 0 ||
        this.selectedAspects.every((aspect: string) => content.perspective.includes(aspect)); // "AND" Filter
      //content.perspective.some((aspect: string) => this.selectedAspects.includes(aspect)); "OR" Filter

      return matchesGradeLevel && matchesTopic && matchesAspect;
    });


    this.filteredContents = filteredContents;
  }

  async search(filter: string) {
    const contents = this.fetchedContents;

    // Filter-String in Kleinbuchstaben und in einzelne Wörter aufteilen
    const keywords = filter.toLowerCase().split(/\s+/); // Trennung bei Leerzeichen

    const filteredContents = contents.filter(content => {
      // Überschrift und Beschreibung in Kleinbuchstaben
      const heading = content.heading.toLowerCase();
      const description = content.description.toLowerCase();

      // Prüfen, ob jedes Schlüsselwort in Überschrift ODER Beschreibung vorkommt
      return keywords.every(keyword => heading.includes(keyword) || description.includes(keyword));
    });

    this.filteredContents = filteredContents;
  }
}
