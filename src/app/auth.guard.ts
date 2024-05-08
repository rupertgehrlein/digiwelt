import { CanActivateFn, Router } from '@angular/router';
import { Injector } from '@angular/core';
//import { SupabaseService } from './services/supabase.service';
import { SupabaseFactoryService } from './services/supabase-factory.service';


//wird im Routing aufgerufen -> wenn jemand auf .de/contents will und nicht angemeldet ist, wird er abgewiesen
export function authGuardFactory(injector: Injector): CanActivateFn {
 return async (route, state) => {
    const supabase = injector.get(SupabaseFactoryService);

    const user = supabase.getClient().auth.getUser();

    if (user && (await user).data && (await user).data.user) {
      return true;
    } else {
      const router = injector.get(Router);
      router.navigate(['/login']);
      return false;
    }
 };
}

/* import { CanActivateFn, Router } from '@angular/router';
import { Injector } from '@angular/core';
import { SupabaseService } from './services/supabase.service';


export function authGuardFactory(injector: Injector): CanActivateFn {
 return async (route, state) => {
    const supabaseService = injector.get(SupabaseService);

    const user = supabaseService.getCurrentUser();

    if (user && (await user).data && (await user).data.user) {
      return true;
    } else {
      const router = injector.get(Router);
      router.navigate(['/']);
      return false;
    }
 };
} */
