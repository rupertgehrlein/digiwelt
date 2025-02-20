import { Component } from '@angular/core';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss'
})
export class ToolsComponent {

  CompUberTools: any[] = [{heading:"CompÜber", description:"Beschreibung 1", link: "https://www.youtube.com/"}];
  InfoDatenTools: any[] = [{heading:"InfoDaten", description:"Beschreibung 1", link: "https://www.youtube.com/"}];
  GrundProgTools: any[] = [{heading:"GrundProg", description:"Beschreibung 1", link: "https://www.youtube.com/"}];
  VernetzungTools: any[] = [{heading:"Vernetzung", description:"Beschreibung 1", link: "https://www.youtube.com/"}];
  AllgemeinTools: any[] = [{heading:"Allgemein", description:"Beschreibung 1", link: "https://www.youtube.com/"}];

}
