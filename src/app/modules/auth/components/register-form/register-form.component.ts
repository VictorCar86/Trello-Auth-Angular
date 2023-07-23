import { AuthService } from '@services/auth.service';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import { RequestStatus } from '@models/request-status.model';
import { CustomValidators } from '@utils/validators';
import { LoginFormComponent } from '../login-form/login-form.component';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
})
export class RegisterFormComponent {

  formEmail = this.formBuilder.nonNullable.group({
    email: ['', [Validators.email, Validators.required]],
  })

  form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.minLength(8), Validators.required]],
    confirmPassword: ['', [Validators.required]],
  }, {
    validators: [ CustomValidators.MatchValidator('password', 'confirmPassword') ]
  });
  status: RequestStatus = 'init';
  statusEmail: RequestStatus = 'init';
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showPassword = false;
  message = '';
  showRegister = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService : AuthService
  ) {}

  // Verifica que el email no este usado
  checkAvailability(){
    if (this.formEmail.valid) {
      this.statusEmail = 'loading';
      const { email } = this.formEmail.getRawValue();
      this.authService.isAvailable(email)
      .subscribe({
        next: (data) => {
          if (data.isAvailable === true) {
            this.statusEmail = 'success';
            this.form.controls.email.setValue(email);
            this.showRegister = true;
          }
          else{
            this.router.navigate(['/login'], {
              queryParams: {email}
            });
          }
        },
        error: (error) => {
          if (error.error.code === 'SQLITE_CONSTRAINT_UNIQUE'){
            this.message = 'This user already exists. Do you want to Login?';
          }
          this.statusEmail = 'failed';
          console.log(error);
        }
      })
      console.log(email);
    } else {
      this.formEmail.markAllAsTouched();
    }
  }

  /* Registra un nuevo usuario y se logea */
  register() {
    if (this.form.valid) {
      this.status = 'loading';
      const { name, email, password } = this.form.getRawValue();
      this.authService.registerAndLogin(name, email, password)
      .subscribe({
        next: () => {
          this.status = 'success';
          this.router.navigate(['/app/boards']);
        },
        error: (error) => {
          if (error.error.code === 'SQLITE_CONSTRAINT_UNIQUE'){
            this.message = 'This user already exists. Do you want to Login?';
          }
          this.status = 'failed';
          console.log(error);

        }
      })
      console.log(name, email, password);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
