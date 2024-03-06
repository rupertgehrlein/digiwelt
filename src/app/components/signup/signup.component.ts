import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
//import { SupabaseService } from '../../services/supabase.service';
import { emailDomainValidator } from '../../email-domain.validator';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';

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
  });

  constructor(private supabaseFactory: SupabaseFactoryService, private readonly formBuilder: FormBuilder) { this.supabase = supabaseFactory.getClient() }

  //kümmert sich um den Signup/Login
  async signUp() {
    try {
      this.loading = true;
      const email = this.signInForm.value.email as string;
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
