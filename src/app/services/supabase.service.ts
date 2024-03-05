import { Injectable } from '@angular/core';
import { SupabaseClient, createClient, AuthSession, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient
  _session: AuthSession | null = null

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  /* getClient(): SupabaseClient { return this.supabase; }

  get auth() {
    return this.supabase.auth;
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await this.supabase.auth.getSession();
    this._session = data.session;
    return this._session;
   }

  get from() {
    return this.supabase.from;
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email })
  }

  signOut() {
    return this.supabase.auth.signOut()
  }

  isLoggedIn(): boolean {
    return this.supabase.auth.getUser() !== null;
  }

  getCurrentUser() {
    return this.supabase.auth.getUser();
  } */

  listenForNewUser() {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { user } = session;
        if (user) {
          // Check if the user's email exists in the `users` table
          const { data: existingUser, error } = await this.supabase
            .from('users')
            .select('email')
            .eq('email', user.email)
            .maybeSingle();

          if (error) {
            console.error('Error checking for existing user:', error);
          } else if (!existingUser) {
            // If the user's email does not exist in the `users` table, insert the new user
            const { data, error: insertError } = await this.supabase
              .from('users')
              .insert([{ id: user.id, email: user.email, is_admin: false }]);

            if (insertError) {
              console.error('Error inserting new user:', insertError);
            } else {
              console.log('New user inserted:', data);
            }
          }
        }
      }
    });
  }

  async isAdmin(): Promise<boolean> {
    const currentUser = await this.supabase.auth.getUser();

    if (!currentUser) {
      return false;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('is_admin')
      .eq('id', currentUser.data.user.id)
      .single();

    if (error) {
      console.error('Fehler beim Abrufen des isAdmin-Werts:', error.message);
      return false;
    }

    return data ? data.is_admin : false;
  }


}
