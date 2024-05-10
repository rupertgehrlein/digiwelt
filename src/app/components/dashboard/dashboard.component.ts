import { Component } from '@angular/core';
import { SupabaseFactoryService } from '../../services/supabase-factory.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  supabase: SupabaseClient;
  contents: any[] = [];
  currentUser: any;

  constructor(private supabaseFactory: SupabaseFactoryService) {
    this.supabase = supabaseFactory.getClient();
  }

  async ngOnInit() {
    await this.getCurrentUserAndFetchContents(); // Wait for currentUser to be fetched before fetching contents
  }

  async getCurrentUserAndFetchContents() {
    this.currentUser = await this.supabase.auth.getUser();

    if (this.currentUser) {
      const userId = this.currentUser.data.user.id;
      await this.fetchContents(userId);
    } else {
      console.error('Current user is undefined');
    }
  }

  async fetchContents(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('contents')
      .select('*')
      .eq('is_disapproved', true)
      .eq('creator_id', userId);

    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }

    this.contents = data || [];
  }
}

