import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-contents',
  templateUrl: './contents.component.html',
  styleUrls: ['./contents.component.scss'],
})

export class ContentsComponent implements OnInit {
  @ViewChild('uploadModal') uploadModal: ElementRef;

  supabase: SupabaseClient;
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  contents: any[] = [];
  contentTitles: any[] = [];
  filterTitle: String = '';
  filterGrade: any = null;
  filterTopic: any = null;
  filterAspect: any = null;
  filterAnwendung: boolean = null;
  filterTechnologie: boolean = null;
  filterWirkung: boolean = null;
  checkAnwendungBool: boolean = false;
  checkTechnologieBool: boolean = false;
  checkWirkungBool: boolean = false;
  favoriteContentIds = [];
  changeForm: FormGroup;
  isAdmin = false;
  currentId;
  private modalInstance: bootstrap.Modal;

  selectedGradeLevels: string[] = [];
  selectedTopics: string[] = [];
  selectedAspects: string[] = [];
  gradeLevels = ['5. Klasse', '6. Klasse'];
  topics = ['Computer überall', 'Informationen und Daten', 'Grundlagen der Programmierung', 'Vernetzung'];
  aspects = ['Anwendung', 'Technologie', 'Wirkung'];

  constructor(private formBuilder: FormBuilder, private supabaseFactory: SupabaseFactoryService) { this.supabase = supabaseFactory.getClient() }

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
      gradeLevel: ['', Validators.required],
      topic: ['', Validators.required],
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
    const {data, error} = await this.supabase
      .from('contents')
      .select('*')
      .eq('is_approved', true)

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }

    this.contents = data || [];
    console.log(this.contents);
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

  async changeContent(): Promise<void> {

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
      checkAnwendung: [data[0].aspectAnwendung],
      checkTechnologie: [data[0].aspectTechnologie],
      checkWirkung: [data[0].aspectWirkung],
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

  // muss noch überarbeitet werden, damit gezielte Filter möglich sind
  filterContent(): void {
    const filteredContents = this.contents.filter(content => {
      const matchesGradeLevel = this.selectedGradeLevels.length === 0 ||
        content.grade_level.some((level: string) => this.selectedGradeLevels.includes(level));

      const matchesTopic = this.selectedTopics.length === 0 ||
        content.topic.some((topic: string) => this.selectedTopics.includes(topic));

      const matchesAspect = this.selectedAspects.length === 0 ||
        content.perspective.some((aspect: string) => this.selectedAspects.includes(aspect));

      return matchesGradeLevel && matchesTopic && matchesAspect;
    });

    this.contents = filteredContents;
  }

  async search(){}

  /* //////Filter - ÜBERARBEITEN/////
  changeFilterTitle() {
    var inputValue = (<HTMLInputElement>document.getElementById('filterText')).value;
    this.filterTitle = inputValue;
    this.fetchContents()
  }

  changeFilterGrade(grade) {
    if (this.filterGrade == grade) {
      this.filterGrade = null;
    }
    else {
      this.filterGrade = grade;
    }
    this.fetchContents()
  }
  changeFilterTopic(topic) {
    if (this.filterTopic == topic) {
      this.filterTopic = null;
    }
    else {
      this.filterTopic = topic;
    }
    this.fetchContents()
  }
  changeFilterAspect(aspect) {
    if (aspect == 'aspect1') {
      this.filterAnwendung = (this.filterAnwendung !== true)
    }
    if (aspect == 'aspect2') {
      this.filterWirkung = (this.filterWirkung !== true)
    }
    if (aspect == 'aspect3') {
      this.filterTechnologie = (this.filterTechnologie !== true)
    }
    this.fetchContents()
  }

  changefilterCombo(combo) {
    switch (combo) {
      case 11: {
        this.filterTopic = "topic1";
        this.filterAnwendung = true;
        this.filterWirkung = false;
        this.filterTechnologie = false;

        this.fetchContents();

        break
      }
      case 12: {
        this.filterTopic = "topic1";
        this.filterAnwendung = false;
        this.filterWirkung = true;
        this.filterTechnologie = false;

        this.fetchContents();

        break

      }
      case 13: {
        this.filterTopic = "topic1";
        this.filterAnwendung = false;
        this.filterWirkung = false;
        this.filterTechnologie = true;

        this.fetchContents();

        break

      }
      case 21: {
        this.filterTopic = "topic2";
        this.filterAnwendung = true;
        this.filterWirkung = false;
        this.filterTechnologie = false;

        this.fetchContents();

        break

      }
      case 22: {
        this.filterTopic = "topic2";
        this.filterAnwendung = false;
        this.filterWirkung = true;
        this.filterTechnologie = false;

        this.fetchContents();

        break

      }
      case 23: {
        this.filterTopic = "topic2";
        this.filterAnwendung = false;
        this.filterWirkung = false;
        this.filterTechnologie = true;

        this.fetchContents();

        break

      }
      case 31: {
        this.filterTopic = "topic3";
        this.filterAnwendung = true;
        this.filterWirkung = false;
        this.filterTechnologie = false;

        this.fetchContents();

        break

      }
      case 32: {
        this.filterTopic = "topic3";
        this.filterAnwendung = false;
        this.filterWirkung = true;
        this.filterTechnologie = false;

        this.fetchContents();

        break

      }
      case 33: {
        this.filterTopic = "topic3";
        this.filterAnwendung = false;
        this.filterWirkung = false;
        this.filterTechnologie = true;

        this.fetchContents();

        break

      }
      case 41: {
        this.filterTopic = "topic4";
        this.filterAnwendung = true;
        this.filterWirkung = false;
        this.filterTechnologie = false;

        this.fetchContents();

        break

      }
      case 42: {
        this.filterTopic = "topic4";
        this.filterAnwendung = false;
        this.filterWirkung = true;
        this.filterTechnologie = false;

        this.fetchContents();

        break

      }
      case 43: {
        this.filterTopic = "topic4";
        this.filterAnwendung = false;
        this.filterWirkung = false;
        this.filterTechnologie = true;

        this.fetchContents();

        break

      }
    }
  }

  clearFilters() {
    this.filterTitle = '';
    this.filterGrade = null;
    this.filterTopic = null;
    this.filterAnwendung = null;
    this.filterTechnologie = null;
    this.filterWirkung = null;
    this.fetchContents()
  }

  /// Checkbox Funktions
  AnwendungChange(event: any) {
    if (event.target.checked) {
      this.checkAnwendungBool = true;
    } else {
      this.checkAnwendungBool = false;
    }
  }

  TechnologieChange(event: any) {
    if (event.target.checked) {
      this.checkTechnologieBool = true;
    } else {
      this.checkTechnologieBool = false;
    }
  }

  WirkungChange(event: any) {
    if (event.target.checked) {
      this.checkWirkungBool = true;
    } else {
      this.checkWirkungBool = false;
    }
  }*/
}

