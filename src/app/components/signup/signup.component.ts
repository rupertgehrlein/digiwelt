import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { emailDomainValidator } from '../../email-domain.validator';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { login } from '../../../environments/environment';
import { sha256 } from 'crypto-js/sha256';

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

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required]]
  })

  registerForm = this.formBuilder.group({
    email: ['', [Validators.required]],
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    school_number: ['', [Validators.required]],
  })

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

  async login() {
    try {
      this.loading = true;
      const email = this.loginForm.value.email as string;

      if (await this.supabaseFactory.isRegistered(email)) {
        console.log('Rückgabe von isRegistered ist: ' + this.supabaseFactory.isRegistered(email));
        const { error } = await this.supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        alert('Checken Sie Ihr Mail-Postfach');
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.signInForm.reset();
      this.loading = false;
    }
  }

  async register() {
    try {
      this.loading = true;
      const email = this.registerForm.value.email as string;
      const firstname = this.registerForm.value.firstname as string;
      const lastname = this.registerForm.value.lastname as string;
      const school_number = this.registerForm.value.school_number as string;
      await this.supabaseFactory.register(email, firstname, lastname, school_number);
      alert('Die Registrierung ist vollständig. Zeitnah wird sich ein Admin um die Anmeldung kümmern.')
    } finally {
      this.registerForm.reset();
      this.loading = false;
    }
  }
}
