import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
//import { SupabaseService } from '../../services/supabase.service'; // Adjust the path as necessary
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  supabase: SupabaseClient;
  isLoggedIn = false;
  isAdmin = false;
  searchTerm: string = '';
  showSearchInputField: boolean = false;

  constructor(private supabaseFactory: SupabaseFactoryService, private router: Router, private ngZone: NgZone, private cdr: ChangeDetectorRef) { this.supabase = supabaseFactory.getClient() }


  //Beim Laden der Seite wird prinzipiell alles gechecked, muss aber noch aufgeräumt werden
  ngOnInit() {
    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        // handle initial session
      } else if (event === 'SIGNED_IN') {

        //hier wird geschaut ob der Nutzer auch angemeldet ist
        const user = this.supabase.auth.getUser().then(async user => {
          if (user && user.data && user.data.user) {
            this.isLoggedIn = true;
            //this.isAdmin = user.data.user;
            this.isAdmin = await this.supabaseFactory.isAdmin();
            this.cdr.detectChanges();
          }
        });
        //this.router.navigate(['/contents']);
      } else if (event === 'SIGNED_OUT') {

        //Reset der Werte wenn User sich ausloggt
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.cdr.detectChanges();
      } else if (event === 'PASSWORD_RECOVERY') {
        // handle password recovery event
      } else if (event === 'TOKEN_REFRESHED') {
        // handle token refreshed event
      } else if (event === 'USER_UPDATED') {
        // handle user updated event
      }

      //data.subscription.unsubscribe();
    })
  }

  /* ngOnDestroy() {
    } */


  //Funktion für den logout
  logout() {
    this.supabase.auth.signOut().then(() => {
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.router.navigate(['']);
      this.cdr.detectChanges();
    });
  }

  //das muss noch alles überarbeitet werden
  toggleSearchInput(): void {
    this.showSearchInputField = !this.showSearchInputField;
  }

  showSearchInput(): void {
    this.showSearchInputField = true;
  }

  hideSearchInput(): void {
    this.showSearchInputField = false;
  }

  search(term: string): void {
    console.log('Searching for:', term);
    // Perform the search logic here
  }

}


/* import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service'; // Adjust the path as necessary
import { BehaviorSubject, Subscription, takeUntil } from 'rxjs';

@Component({
 selector: 'app-navbar',
 templateUrl: './navbar.component.html',
 styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
 isLoggedIn = false;
 private unsubscribeAuthStateChange: (() => void) | null = null;
 $onDestroy = new BehaviorSubject(0);

 constructor(private supabase: SupabaseService) {}

 ngOnInit() {
  this.supabase.auth
  .onAuthStateChange
  .pipe(takeUntil(this.$onDestroy))
  ((event, session) => {
    this.isLoggedIn = !!session;
  });
}

ngOnDestroy() {
  // Call the unsubscribe function to clean up the subscription
  if (this.unsubscribeAuthStateChange) {
    this.unsubscribeAuthStateChange();
    this.$onDestroy.next();
    this.$onDestroy.complete();
  }
}

 async logout() {
    await this.supabase.signOut();
 }
} */
