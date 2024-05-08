import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseFactoryService {
  private client: SupabaseClient;

  constructor() { this.client = createClient(environment.supabaseUrl, environment.supabaseKey) }

  getClient(): SupabaseClient {
    return this.client;
  }

 /*  async getUUID() {
    const { data, error } = await this.client.auth.admin.getUserById(1)

    return data;
  } */

  //Funktion zum Check ob der angemeldete User auch Admin ist
  async isAdmin(): Promise<boolean> {
    const currentUser = await this.client.auth.getUser();

    if (!currentUser) {
      return false;
    }

    const { data, error } = await this.client
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

  listenForNewUser() {
    return this.client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { user } = session;
        if (user) {
          // Schaut ob User schon registriert ist
          const { data: existingUser, error } = await this.client
            .from('users')
            .select('email')
            .eq('email', user.email)
            .maybeSingle();

          if (error) {
            console.error('Error checking for existing user:', error);
          } else if (!existingUser) {
            // Wenn User noch nicht registriert ist, wird er hinzugefügt
            const { data, error: insertError } = await this.client
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
}
