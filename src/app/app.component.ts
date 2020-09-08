import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  error = false;
  signUp = true;
  errorMessage: any;

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName: [
        '',
        { validators: [Validators.required], updateOn: 'change' },
      ],
      lastName: ['', { validators: [Validators.required], updateOn: 'change' }],
      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.email,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ],
          asyncValidators: [this.createEmailValidator()],
          updateOn: 'change',
        },
      ],
      password: [
        '',
        {
          validators: [Validators.required, Validators.minLength(6)],
          updateOn: 'change',
        },
      ],
    });
  }

  // To access form fields easily in view
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.http
      .post('https://api.raisely.com/v3/signup', {
        campaignUuid: '46aa3270-d2ee-11ea-a9f0-e9a68ccff42a',
        data: {
          firstName: this.registerForm.value.firstName,
          lastName: this.registerForm.value.lastName,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
        },
      })
      .subscribe(
        (res) => {
          this.error = false;
          this.signUp = false;
        },
        (err) => {
          this.signUp = false;
          console.log('Error in Registration');
          this.errorMessage = err.error.errors[0].message;
          this.error = true;
        }
      );
  }

  //Custom Email Validator Function
  createEmailValidator(): AsyncValidatorFn {
    return ({ value }: AbstractControl): Observable<ValidationErrors> => {
      return this.http
        .post('https://api.raisely.com/v3/check-user', {
          campaignUuid: '46aa3270-d2ee-11ea-a9f0-e9a68ccff42a',
          data: {
            email: value,
          },
        })
        .pipe(
          debounceTime(500),
          map((res: any) => {
            return res.data.status === 'EXISTS' ? { exists: true } : null;
          })
        );
    };
  }

  reset() {
    this.registerForm.reset({
      firstName: [],
      lastName: [],
      email: [],
      password: [],
    });
    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
    this.signUp = true;
    this.error = false;
    this.submitted = false;
  }
}
