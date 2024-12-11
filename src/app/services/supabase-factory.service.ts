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

  async changeUserMail(oldEmail, newEmail){
    const { data: existingUser, error: userError } = await this.client
      .from('users')
      .select('email')
      .eq('email', oldEmail)
      .maybeSingle();

    if(existingUser){
      const { data, error } = await this.client
        .from('users')
        .update({email: newEmail})
        .eq("email", oldEmail)

      alert("Mailadresse des Nutzers erfolgreich geändert.")
    } else {
      alert("Es gibt ein Problem: Die Mailadresse konnte nicht geändert werden. Wahrscheinlich ist diese Mailadresse nicht registriert.")
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

  async fetchAllContents(is_approved: boolean, is_disapproved: boolean): Promise<any> {
    const { data, error } = await this.client
      .from('contents')
      .select('*')
      .eq('is_approved', is_approved)
      .eq('is_disapproved', is_disapproved)

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }
    return data;
  }
  async getUserContentByApprovement(is_approved: boolean, is_disapproved: boolean,userID: string): Promise<any>{

    const { data, error } = await this.client
      .from('contents')
      .select('*')
      .eq('is_approved', is_approved)
      .eq('is_disapproved', is_disapproved)
      .eq('creator_id', userID);

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }
  }

  async getContentsByID(ID: string): Promise<any> {
    const { data, error } = await this.client
      .from('contents')
      .select('*')
      .eq('id', ID);

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }
    return data;
  }

  async getContentsByCreatorID(userID: string): Promise<any> {
    const { data, error } = await this.client
      .from('contents')
      .select('*')
      .eq('creator_id', userID);

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }
    return data;
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

  async getOwnContentDetails(){
    const { data: ownContents, error: ownContentsError } = await this.client
      .from('contents')
      .select('id')
      .eq('creator_id', (await this.client.auth.getUser()).data.user.id);

    if (ownContentsError) {
      console.error('Error fetching favorites:', ownContentsError.message);
      throw ownContentsError;
    }

    const ownIds = ownContents.map(own => own.id);

    if (ownIds.length === 0) {
      return [];
    }

    const { data: contents, error: contentError } = await this.client
      .from('contents')
      .select('*')
      .eq('is_approved', true)
      .in('id', ownIds);

    if (contentError) {
      console.error('Error fetching content details:', contentError.message);
      throw contentError;
    }

    return contents;
  }

  async uploadContent(uniqueFileName, formData, heading, description, gradeLevel, file_format, topic, perspective){
    const { data, error } = await this.client
      .storage
      .from('pdf_uploads')
      .upload(uniqueFileName, formData);

    if (error) {
      console.error('Error uploading file:', error);
      return;
    }

    const pdfFileUrl = data?.path;

    const { data: contentData, error: contentError } = await this.client
      .from('contents')
      .insert([
        {
          created_at: (new Date()).toISOString(),
          heading: heading,
          description: description,
          grade_level: gradeLevel,
          creator_id: (await this.client.auth.getUser()).data.user.id,
          is_approved: false,
          is_disapproved: false,
          pdf_file_url: pdfFileUrl,
          file_format: file_format,
          topic: topic,
          perspective: perspective
        },
      ]);

    if (contentError) {
      console.error('Error inserting content:', contentError);
      return;
    }
  }

  async updateContent(heading, description, gradeLevel, topic, perspective, id){
    
    const { data: contentData, error: contentError } = await this.client
      .from('contents')
      .update([
        {
          heading: heading,
          description: description,
          grade_level: gradeLevel,
          topic: topic,
          perspective: perspective
        },
      ])
      .eq('id', id);

    if (contentError) {
      console.error('Error inserting content:', contentError);
      return;
    }
  }


  async updateDisapprovedContent(heading, description, gradeLevel, topic, perspective, id){
      
    const { data: contentData, error: contentError } = await this.client
      .from('contents')
      .update([
        {
          heading: heading,
          description: description,
          grade_level: gradeLevel,
          topic: topic,
          perspective: perspective,
          is_disapproved: false,
        },
      ])
      .eq('id', id);

    if (contentError) {
      console.error('Error inserting content:', contentError);
      return;
    }
  }

  async fetchRegisteredUsers(): Promise<any> {
    const { data, error } = await this.client
      .from('unregistered_users')
      .select('*')

    if (error) {
      console.error('Fetching unregistered Users failed: ', error);
      return;
    }
    return data;
  }
  
  // Funktion zur signierten URL Erstellung für den sicheren Datei-Download
  async generateSignedUrl(filePath: string): Promise<string | null> {
    const { data, error } = await this.client
      .storage
      .from('pdf_uploads')
      .createSignedUrl(filePath, 3600); // Link ist für 1 Stunde gültig, eigentlich in dem SetUp aber egal

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data?.signedUrl;
  }

  async setApproved(id): Promise<void> {
    const { error } = await this.client
      .from('contents')
      .update({ is_approved: true })
      .eq('id', id)

    if (error) {
      console.error('Error updating content approval status:', error);
      return;
    }
  }

  async setDisapproved(comment: string, currentId): Promise<void>{
    const { error } = await this.client
    .from('contents')
    .update({ is_disapproved: true, admin_comment: comment })
    .eq('id', currentId)
    console.log(currentId);

  if (error) {
    console.error('Error updating content approval status:', error);
    return;
  }
  }
}