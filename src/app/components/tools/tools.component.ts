import { Component } from '@angular/core';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss'
})
export class ToolsComponent {

  CompUberTools: any[] =
  [{
    heading:"Bill's Computer Workshop", 
    description:"Bill's Computer Workshop ist eine immersive Lernumgebung (VR), in der die Lernenden das Innenleben eines Computers erkunden. Im Computer treffen die Lernenden auf Mechaniker Bill dem sie helfen sollen, den Computer zu reparieren. Dabei lernen die Lernenden die verschiedenen Komponenten eines Computers und deren Funktion kennen. Wird mit einer Komponente interagiert, so bekommen die Lernenden mehr Informationen über die Funktion und die Interaktion der Komponente mit dem Rest des Systems.", 
    link: "https://andydengel.itch.io/bills-computer-workshop"
    },
    {
      heading:"Fritzing", 
      description:"Mit der Open-Source-Software Fritzing können elektronische Schaltungen am Computer erstellt werden. Dafür steht eine umfangreiche Bibliothek mit Bauteilgrafiken zur Verfügung, die auch Komponenten verbreiteter Mikrocontroller oder Hardware Hersteller wie Arduino oder SparkFun enthalten. Weitere Bauteile stehen im Internet zum Herunterladen zur Verfügung, zudem ist das Hinzufügen eigener Komponenten möglich. Mit der Fritzing-Software können Einsteiger*innen leicht nachvollziehbare, grafische Schaltmodelle erstellen, die von der Software auch in Schaltpläne mit genormten Schaltzeichen umgewandelt werden. Angelegte Schaltpläne lassen sich zur Dokumentation eigener Projekte speichern oder exportieren. In der Projektdatenbank stehen darüber hinaus zahlreiche Schaltpläne anderer Nutzer*innen zur Inspiration oder als Lernunterstützung zur Verfügung, eigene Projekte können über die Projektdatenbank mit anderen geteilt werden", 
      link: "https://fritzing.org"
    },
    {
      heading:"Micro:Bit", 
      description:"Der MicroBit ist ein Einplatinencomputer mit LED-Lichtern, verschiedenen Sensoren, Knöpfen und einem USB-Anschluss. SuS haben viele Möglichkeiten, den MicroBit verschiedenste Anweisungen ausführen zu lassen. Hierfür erstellen sie einen Anweisungscode auf dem Computer/Tablet/Handy und kopieren es auf den MicroBit, welcher die Anweisungen ausführt. Der Code kann online entweder als blockbasierte Programmiersprache oder über Texteingabe in unterschiedlichen Programmiersprachen erstellt werden. Man kann hierfür auch Programme runterladen. SuS lernen beim Schreiben des Codes mit den algorithmischen Grundbausteinen zu arbeiten und bekommen ein Verständnis für den Zusammenhang zwischen Programmcode und Rechner. ", 
      link: "https://microbit.org/"
    },
    {
      heading:"Arduino", 
      description:"Eine Open-Source-Mikrocontroller-Plattform, die für interaktive Elektronikprojekte genutzt wird. Mit Arduino können Schülerinnen und Schüler durch Programmierung von Sensoren, LEDs und Motoren grundlegende Kenntnisse in Elektronik und Programmierung erlangen.", 
      link: "https://www.arduino.cc"
    },
    {
      heading:"LEGO Spikes", 
      description:"Ein für den Bildungsbereich entwickeltes Robotik-Kit mit einer benutzerfreundlichen, blockbasierten Programmierumgebung. Es unterstützt Schülerinnen und Schüler dabei, Grundlagen der Robotik und Programmierung durch praktische Projekte zu erlernen.", 
      link: "https://spike.legoeducation.com"
    },
    {
      heading:"OpenRoberta", 
      description:"Eine browserbasierte, blockbasierte Programmierumgebung, die es ermöglicht, verschiedene Robotersysteme (z. B. LEGO Mindstorms, Calliope Mini, Arduino) zu programmieren. Open Roberta erleichtert den Einstieg in die Programmierung durch eine intuitive, visuelle Oberfläche.", 
      link: "https://lab.open-roberta.org"
    }
  ];

  InfoDatenTools: any[] = 
  [
    {
      heading:"CrypTool 1", 
      description:"Das Programm CrypTool 1 (CT1) ist ein kostenloses Windows-Programm für Kryptografie und Kryptoanalyse.", 
      link: "https://www.cryptool.org/de/ct1/"
    }
  ];

  GrundProgTools: any[] = 
  [
    {
      heading:"Scratch", 
      description:"Scratch ist die weltweit größte Coding-Community für Kinder und eine einfache, visuelle Programmiersprache, mit der junge Menschen ganz einfach digitale Geschichten, Spiele und Animationen erstellen können. Die Scratch Foundation, eine Non-Profit-Organisation, designt, entwickelt und moderiert Scratch. Scratch fördert informatisches Denken und Problemlösungskompetenzen, Kreativität beim Unterrichten und Lernen, Eigendarstellung und Teamarbeit sowie Chancengleichheit am Computer.", 
      link: "https://scratch.mit.edu/"
    },
    {
      heading:"Delightex (ehem. 'CoSpaces')", 
      description:"Delightex ist eine intuitive Software, in der sich virtuelle Welten spielerisch leicht entwerfen lassen. So können selbst Kinder im Grundschulalter eigene 3D Räume erschaffen.", 
      link: "https://www.delightex.com"
    },
    {
      heading:"Robot Karol", 
      description:"Robot Karol ist eine Programmierumgebung mit einer Programmiersprache, die für Schülerinnen und Schüler zum Erlernen des Programmierens und zur Einführung in die Algorithmik gedacht ist. Robot Karol folgt der Tradition der “Mini-Languages”. Dies sind Programmiersprachen, die bewusst über einen kleinen, übersichtlichen Sprachumfang verfügen, um den Einstieg in die Algorithmik zu erleichtern.", 
      link: "https://karol.arrrg.de"
    },
    {
      heading:"Micro:Bit", 
      description:"Der MicroBit ist ein Einplatinencomputer mit LED-Lichtern, verschiedenen Sensoren, Knöpfen und einem USB-Anschluss. SuS haben viele Möglichkeiten, den MicroBit verschiedenste Anweisungen ausführen zu lassen. Hierfür erstellen sie einen Anweisungscode auf dem Computer/Tablet/Handy und kopieren es auf den MicroBit, welcher die Anweisungen ausführt. Der Code kann online entweder als blockbasierte Programmiersprache oder über Texteingabe in unterschiedlichen Programmiersprachen erstellt werden. Man kann hierfür auch Programme runterladen. SuS lernen beim Schreiben des Codes mit den algorithmischen Grundbausteinen zu arbeiten und bekommen ein Verständnis für den Zusammenhang zwischen Programmcode und Rechner. ", 
      link: "https://microbit.org/"
    },
    {
      heading:"MIT AppInventor", 
      description:"Mit dem MIT App Inventor lassen sich Apps auf einfache und anschauliche Art und Weise mithilfe einer blockbasierten Programmiersprache programmieren. Das Design der Apps lässt sich über Drag-and-Drop der einzelnen Komponenten erstellen. Jedoch können die Komponenten nicht frei in das Layout eingefügt werden, sodass das Design mitunter schwer an die eigenen Vorstellungen angepasst werden kann. Die erstellten Apps können jederzeit auf Android oder iOS Geräten getestet werden, aber auch auf dem PC direkt, sodass kein mobiles Endgerät notwendig ist. Die Sprache der Umgebung kann zudem auf Deutsch eingestellt werden.", 
      link: "https://appinventor.mit.edu/"
    },
    {
      heading:"LOGO: Turtle Academy", 
      description:"Das Projekt enthält eine clientseitige Lernumgebung und einen Compiler für Logo. Das Projekt ermöglicht das Erlernen der Logo-Sprache und der Programmierprinzipien und kann zur Programmierung von Logo verwendet werden", 
      link: "https://turtleacademy.com/"
    },
    {
      heading:"Arduino", 
      description:"Eine Open-Source-Mikrocontroller-Plattform, die für interaktive Elektronikprojekte genutzt wird. Mit Arduino können Schülerinnen und Schüler durch Programmierung von Sensoren, LEDs und Motoren grundlegende Kenntnisse in Elektronik und Programmierung erlangen.", 
      link: "https://www.arduino.cc"
    },
    {
      heading:"LEGO Spikes", 
      description:"Ein für den Bildungsbereich entwickeltes Robotik-Kit mit einer benutzerfreundlichen, blockbasierten Programmierumgebung. Es unterstützt Schülerinnen und Schüler dabei, Grundlagen der Robotik und Programmierung durch praktische Projekte zu erlernen.", 
      link: "https://spike.legoeducation.com"
    },
    {
      heading:"OpenRoberta", 
      description:"Eine browserbasierte, blockbasierte Programmierumgebung, die es ermöglicht, verschiedene Robotersysteme (z. B. LEGO Mindstorms, Calliope Mini, Arduino) zu programmieren. Open Roberta erleichtert den Einstieg in die Programmierung durch eine intuitive, visuelle Oberfläche.", 
      link: "https://lab.open-roberta.org"
    },
  ];

  VernetzungTools: any[] = 
  [
    {
      heading:"w3schools", 
      description:"w3schools.com ist eine Webseite, die Tutorials für verschiedene Programmiersprachen und HTML anbietet. So können hier Schülerinnen und Schüler eigenständig oder unter Anleitung einer Lehrkraft in HTML einsteigen. Zusätzlich bietet w3schools.com eine Umgebung, die direkt die Umsetzung von HTML-Code ermöglicht und diese gibt ebenfalls eine Fehlermeldung aus, sobald der Code nicht korrekt ist. Insbesondere wenn die Klasse bestimmte Codeschnipsel testen soll, kann sie genau diese Umgebung testen. Darüber hinaus können die Möglichkeiten von HTML direkt bei w3schools.com in der Seitenleiste nachgeschaut werden, um anschließend eine Implementierung auszuprobieren", 
      link: "https://www.w3schools.com/html/html_intro.asp"
    },
    {
      heading:"WebNetSim", 
      description:"Bei WebNetSim handelt es sich um eine Internetseite, welche als didaktisches Werkzeug zur Einarbeitung in die Themen Netzstruktur des Internets, Client und Webserver und Netzwerkdienste- und protokolle benutzt werden kann. Dabei ermöglicht WebNetSim, dass die Nutzerinnen und Nutzer miteinander ein fiktives Netzwerk aus Routern, Computern und Servern simulieren können. Darüber hinaus beinhaltet die Useroberfläche einen Aufgabenkatalog, der zur Vertiefung des Verständnisses abgearbeitet werden kann. ", 
      link: " https://webnetsim.de "
    },
    {
      heading:"Filius", 
      description:"Bei der Lernsoftware Filius handelt es sich um ein Programm, welches den Usern ermöglicht aus zahlreichen Komponenten ein fiktives Netzwerk einzurichten, um das Verständnis zur Thematik zu vertiefen.", 
      link: "https://www.lernsoftware-filius.de/Startseite"
    },
    {
      heading:"SelfHTML", 
      description:"Die Internetseite 'SelfHTML' bietet Lernenden die Möglichkeit ein geführtes Tutorial in vier Lerneinheiten zu je 30 Minuten über HTML abzuschließen. Im Rahmen des Tutorials werden praxisnahe Lernaufgaben (teils unter Anleitung) vorgegeben, die zum Verständnis des Themas HTML erledigt werden sollten.", 
      link: "https://wiki.selfhtml.org/wiki/HTML/Tutorials/Einstieg/Erste_Schritte"
    },
    {
      heading:"SOEKIA", 
      description:"Soekia ist eine Suchmaschine speziell für den Unterricht. Mit Soekia kannst Du hinter die Kulissen schauen und damit die Grundprinzipien von Suchmaschinen kennenlernen. Des Weiteren bietet Soekia zusätzlich die Möglichkeit, sich über generative Sprachmodelle zu informieren.", 
      link: "https://www.soekia.ch"
    },
    {
      heading:"SMAwT", 
      description:"Das Social Media Awareness Tool (SMAwT) ist ein spielerisches Selbstlernmodul zu den Themen Social Media, Passwörter und Datenschutz. Lernende können hier die Geschichte des Influencers Simon auf der fiktiven Plattform 'Pointer' nachverfolgen. ", 
      link: " https://smawt.codislabgraz.org/"
    },
    {
      heading:"GetBadNews", 
      description:"Von Fake News zum totalen Chaos! Wie böse bist du? Bekomme so viele Follower*innen, wie du nur kannst.", 
      link: "https://www.getbadnews.com/de"
    }
  ];

  AllgemeinTools: any[] =
  [
    {
      heading:"CSUnplugged", 
      description:"CS Unplugged ist eine Sammlung kostenloser Lehrmaterialien, durch die Informatik anhand von anregenden Spielen und Aufgaben mit Karten, Bindfaden, Wachsstiften und viel Herumrennen gelehrt wird.", 
      link: "https://www.csunplugged.org/de/"
    },
    {
      heading:"Moral Machine", 
      description:"Diese Plattform erfasst, wie Menschen zu moralischen Entscheidungen stehen, die von intelligenten Maschinen, wie z.B. selbstfahrenden Autos, getroffen werden.", 
      link: "https://www.moralmachine.net/hl/de"
    },
    {
      heading:"schulKI", 
      description:"Die deutsche Plattform schulKI.de befindet sich momentan in der Beta-Phase. Als eine von Lehrer*innen für Lehrer*innen entwickelte Plattform bietet die Seite die Möglichkeit, ChatGPT sicher in den schulischen Kontext zu holen. ChatGPT bietet bekanntermaßen völlig neue Möglichkeiten in der Unterrichtsvorbereitung als auch während des Unterrichts. Problematisch ist bei der Verwendung des Chatbots mit Schüler*innen, dass die Kinder und Jugendlichen ihre private Handynummer und ihre E-Mail-Adressen bei der Registrierung eingeben müssen. Außerdem werden die eingegebenen Daten auf amerikanische Server des Anbieters OpenAI übertragen. In Schulen stellt das aus datenschutztechnischen Gründen ein großes Problem dar. Die neue Plattform schulKI.de soll nun dabei helfen, den Chatbot sicher im Unterricht einzusetzen.", 
      link: "https://schulki.de"
    }
  ];

}
