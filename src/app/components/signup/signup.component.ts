import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { emailDomainValidator } from '../../email-domain.validator';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { login } from '../../../environments/environment';
import * as sha256 from 'crypto-js/sha256';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  supabase: SupabaseClient;
  loading = false;

  //schaut ob Daten eingetragen sind
  signInForm = this.formBuilder.group({
    email: ['', [Validators.required, emailDomainValidator]],
    password: ['', [Validators.required]]
  });

  constructor(private supabaseFactory: SupabaseFactoryService, private readonly formBuilder: FormBuilder) { this.supabase = supabaseFactory.getClient() }

  //kümmert sich um den Signup/Login
  async signUp() {
    try {
      this.loading = true;
      const email = this.signInForm.value.email as string;
      const password = this.signInForm.value.password as string; // Get the password from the form
      const hashedPassword = sha256(password).toString(); //hashing the password because it is saved hashed in the file

      // Validate the password against the predefined hash
      if (hashedPassword !== login.password) {
        alert('Das Passwort ist nicht korrekt. Geben Sie es bitte erneut ein.');
        return; // Exit the function if the password is incorrect
      }
      const { error } = await this.supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Checken Sie Ihr Mail-Postfach');
      this.supabaseFactory.listenForNewUser();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.signInForm.reset();
      this.loading = false;
    }
  }
}
