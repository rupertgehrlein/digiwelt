import { CanActivateFn, Router } from '@angular/router';
import { Injector } from '@angular/core';
//import { SupabaseService } from './services/supabase.service';
import { SupabaseFactoryService } from './services/supabase-factory.service';


//wird im Routing aufgerufen -> wenn jemand auf .de/admin will und kein Admin ist, wird er abgewiesen
export function adminGuardFactory(injector: Injector): CanActivateFn {
 return async (route, state) => {
    const supabase = injector.get(SupabaseFactoryService);

    const user = supabase.getClient().auth.getUser();

    if (user && (await user).data && (await user).data.user) {
      const userData = (await user).data.user;

      if(await supabase.isAdmin()){
        return true;
      }
    }

    const router = injector.get(Router);
    router.navigate(['/dashboard']); // Redirect to homepage if not an admin
    return false; // Ensure that the function returns false if the user is not an admin
 };
}

/* import { CanActivateFn, Router } from '@angular/router';
import { Injector } from '@angular/core';
import { SupabaseService } from './services/supabase.service';

export function adminGuardFactory(injector: Injector): CanActivateFn {
 return async (route, state) => {
    const supabaseService = injector.get(SupabaseService);

    const user = supabaseService.getCurrentUser();

    if (user && (await user).data && (await user).data.user) {
      const userData = (await user).data.user;

      if(await supabaseService.isAdmin()){
        return true;
      }
    }

    const router = injector.get(Router);
    router.navigate(['/']); // Redirect to homepage if not an admin
    return false; // Ensure that the function returns false if the user is not an admin
 };
} */
