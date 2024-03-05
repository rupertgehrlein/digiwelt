// email-domain.validator.ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function emailDomainValidator(control: AbstractControl): ValidationErrors | null {
 const email = control.value;
 const domainRegex = /^.*@(schule\.hessen\.de|uni-frankfurt\.de|.*\.uni-frankfurt\.de)$/;

 if (email && domainRegex.test(email)) {
    return null;
 } else {
    return { invalidDomain: true };
 }
}
