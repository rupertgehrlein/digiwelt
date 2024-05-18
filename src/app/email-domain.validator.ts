// email-domain.validator.ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

//einfache Funktion, die den Aufbau von einer gültigen Mailadresse kontrolliert
export function emailDomainValidator(control: AbstractControl): ValidationErrors | null {
 const email = control.value;
 const domainRegex = /^.*@(.*\.hessen\.de|uni-frankfurt\.de|.*\.uni-frankfurt\.de)$/;

 if (email && domainRegex.test(email)) {
    return null;
 } else {
    return { invalidDomain: true };
 }
}
