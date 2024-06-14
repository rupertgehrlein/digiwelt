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

  async isRegistered(email) {
    // Schaut ob User schon registriert ist
    const { data: existingUser, error } = await this.client
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error checking for existing user:', error);
      return false;
    } else if (existingUser) {
      return true;
    } else {
      alert('Diese Mail ist noch nicht durch einen Admin bestätigt oder wurde noch nicht registriert. Wenn Sie schon lange auf die Bestätigung warten, melden Sie sich bitte beim Admin-Team.');
      return false;
    }
  }

  //irgendwie ist das noch ein bisschen buggy...er schmeißt noch die falschen Fehlercodes
  async register(email, firstname, lastname, school_number) {
    const { data, error: registerError } = await this.client
      .from('unregistered_users')
      .insert([{ email: email, firstname: firstname, lastname: lastname, school_number: school_number }])

    if (registerError.code == '23505') {
      alert('Ein Fehler ist aufgetreten. Die Mailadresse wurde bereits registriert.')
    } else if (registerError) {
      console.error('Error inserting new user:', registerError);
    } else {
      console.log('New user inserted:', data);
    }

    return;
  }

  async newUserAccepted(id, email) {
    await this.client
      .from('users')
      .insert([{ id: id, email: email, is_admin: false }])

    await this.removeUnregisteredUser(id);
  }

  async removeUnregisteredUser(id) {
    await this.client
      .from('unregistered_users')
      .delete()
      .eq('id', id)
  }


  async getFavorites(){
    const userId = (await this.client.auth.getUser()).data.user.id;
    console.log(userId);
    const { data, error } = await this.client
      .from('favorites')
      .select('content_id')
      .eq('user_id', userId);  // Ändere hier "id" zu "user_id"

    if (error) {
      console.error('Error fetching favorites:', error.message);
      throw error;
    }

    return data.map(fav => fav.content_id);
  }

  async addFavorite(contentId) {
    const userId = (await this.client.auth.getUser()).data.user.id;
    const { data, error } = await this.client
      .from('favorites')
      .insert({ user_id: userId, content_id: contentId });

    if (error) throw error;
    return data;
  }

  async removeFavorite(contentId) {
    const userId = (await this.client.auth.getUser()).data.user.id;
    const { data, error } = await this.client
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) throw error;
    return data;
  }

}
