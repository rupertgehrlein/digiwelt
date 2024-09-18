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
      return false;
    }

    return data ? data.is_admin : false;
  }

  async promoteToAdmin(email) {
    const { data: existingUser, error: userError } = await this.client
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      const { data, error } = await this.client
        .from('users')
        .update({ is_admin: true })
        .eq("email", email)

      alert("Der Nutzer wurde erfolgreich zum Admin befördert.");
    } else {
      alert("Der Nutzer konnte nicht zum Admin gemacht werden. Checken Sie die Schreibweise der Mailadresse oder fragen Sie beim Nutzer nach, ob die angegebene Email-Adresse auch wirklich registriert ist.");
    }
  }

  listenForNewUser() {
    return this.client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { user } = session;
        if (user) {
          // Schaut ob User schon registriert ist
          const { data: existingUser, error: userError } = await this.client
            .from('users')
            .select('email')
            .eq('email', user.email)
            .maybeSingle();

          if (userError) {
            console.error('Error checking for existing user:', userError);
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
      .single();

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

  async newUserAccepted(email) {
    await this.client
      .from('users')
      .insert([{ email: email, is_admin: false }])

    await this.removeUnregisteredUser(email);
  }

  async removeUnregisteredUser(email) {
    await this.client
      .from('unregistered_users')
      .delete()
      .eq('email', email)
  }

  async updateId() {
    const mail = (await this.client.auth.getUser()).data.user.email;

    const { data: idData, error: idError } = await this.client
      .from('users')
      .select('id')
      .eq('email', mail)

    const authId = (await this.client.auth.getUser()).data.user.id;

    if (idData[0].id !== authId) {
      await this.client
        .from('users')
        .update({ id: authId })
        .eq('id', idData[0].id)
    }
  }

  async getFavorites() {
    await this.updateId();
    const userID = (await this.client.auth.getUser()).data.user.id;
    const { data, error } = await this.client
      .from('favorites')
      .select('content_id')
      .eq('user_id', (await this.client.auth.getUser()).data.user.id);

    if (error) {
      console.error('Error fetching favorites:', error.message);
      throw error;
    }

    return data.map(fav => fav.content_id);
  }

  async addFavorite(contentId) {
    const { data, error } = await this.client
      .from('favorites')
      .insert({ user_id: (await this.client.auth.getUser()).data.user.id, content_id: contentId });

    if (error) throw error;
    return data;
  }

  async removeFavorite(contentId) {
    const { data, error } = await this.client
      .from('favorites')
      .delete()
      .eq('user_id', (await this.client.auth.getUser()).data.user.id)
      .eq('content_id', contentId);

    if (error) throw error;
    return data;
  }

  async getFavoriteDetails(): Promise<any[]> {
    const { data: favorites, error: favError } = await this.client
      .from('favorites')
      .select('content_id')
      .eq('user_id', (await this.client.auth.getUser()).data.user.id);

    if (favError) {
      console.error('Error fetching favorites:', favError.message);
      throw favError;
    }

    const favoriteIds = favorites.map(fav => fav.content_id);

    if (favoriteIds.length === 0) {
      return [];
    }

    const { data: contents, error: contentError } = await this.client
      .from('contents')
      .select('*')
      .in('id', favoriteIds);

    if (contentError) {
      console.error('Error fetching content details:', contentError.message);
      throw contentError;
    }

    return contents;
  }

  async getContentDetails(contentId: string): Promise<any> {
    const { data, error } = await this.client
      .from('contents')
      .select('*')
      .eq('id', contentId)
      .single();

    if (error) {
      console.error('Error fetching content details:', error.message);
      throw error;
    }

    return data;
  }

}


/* import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseFactoryService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async isAdmin(): Promise<boolean> {
    const currentUser = await this.client.auth.getUser();

    if (!currentUser) {
      return false;
    }

    const { data, error } = await this.client
      .from('users')
      .select('is_admin')
      .eq('auth_uid', currentUser.data.user.id)
      .single();

    if (error) {
      return false;
    }

    return data ? data.is_admin : false;
  }

  listenForNewUser() {
    return this.client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { user } = session;
        if (user) {
          const { data: existingUser, error } = await this.client
            .from('users')
            .select('id, auth_uid')
            .eq('email', user.email)
            .single();

          if (error) {
            console.error('Error checking for existing user:', error);
          } else if (existingUser) {
            if (!existingUser.auth_uid) {
              const { data, error: updateError } = await this.client
                .from('users')
                .update({ auth_uid: existingUser.id })
                .eq('id', existingUser.id);

              if (updateError) {
                console.error('Error updating user auth_uid:', updateError);
              } else {
                console.log('User auth_uid updated:', data);
              }
            }
          } else {
            const { data, error: insertError } = await this.client
              .from('users')
              .insert([{ auth_uid: user.id, email: user.email, is_admin: false }]);

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

  async isRegistered(email: string): Promise<boolean> {
    const { data: existingUser, error } = await this.client
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

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

  async register(email: string, firstname: string, lastname: string, school_number: string): Promise<void> {
    const { data, error: registerError } = await this.client
      .from('unregistered_users')
      .insert([{ email, firstname, lastname, school_number }]);

    if (registerError && registerError.code === '23505') {
      alert('Ein Fehler ist aufgetreten. Die Mailadresse wurde bereits registriert.');
    } else if (registerError) {
      console.error('Error inserting new user:', registerError);
    } else {
      console.log('New user inserted:', data);
    }
  }

  async newUserAccepted(email: string): Promise<void> {
    await this.client
      .from('users')
      .insert([{ email: email, is_admin: false }]);

    await this.removeUnregisteredUser(email);
  }

  async removeUnregisteredUser(email: string): Promise<void> {
    await this.client
      .from('unregistered_users')
      .delete()
      .eq('email', email);
  }

  async getFavorites(): Promise<string[]> {
    const { data, error } = await this.client
      .from('favorites')
      .select('content_id')
      .eq('user_id', (await this.client.auth.getUser()).data.user.id);

    if (error) {
      console.error('Error fetching favorites:', error.message);
      throw error;
    }

    return data.map(fav => fav.content_id);
  }

  async addFavorite(contentId: string): Promise<any> {
    const { data, error } = await this.client
      .from('favorites')
      .insert({ user_id: (await this.client.auth.getUser()).data.user.id, content_id: contentId });

    if (error) throw error;
    return data;
  }

  async removeFavorite(contentId: string): Promise<any> {
    const { data, error } = await this.client
      .from('favorites')
      .delete()
      .eq('user_id', (await this.client.auth.getUser()).data.user.id)
      .eq('content_id', contentId);

    if (error) throw error;
    return data;
  }

  async getFavoriteDetails(): Promise<any[]> {
    const { data: favorites, error: favError } = await this.client
      .from('favorites')
      .select('content_id')
      .eq('user_id', (await this.client.auth.getUser()).data.user.id);

    if (favError) {
      console.error('Error fetching favorites:', favError.message);
      throw favError;
    }

    const favoriteIds = favorites.map(fav => fav.content_id);

    if (favoriteIds.length === 0) {
      return [];
    }

    const { data: contents, error: contentError } = await this.client
      .from('contents')
      .select('*')
      .in('id', favoriteIds);

    if (contentError) {
      console.error('Error fetching content details:', contentError.message);
      throw contentError;
    }

    return contents;
  }

  async getContentDetails(contentId: string): Promise<any> {
    const { data, error } = await this.client
      .from('contents')
      .select('*')
      .eq('id', contentId)
      .single();

    if (error) {
      console.error('Error fetching content details:', error.message);
      throw error;
    }

    return data;
  }
} */

