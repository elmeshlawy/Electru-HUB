import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Getter helpers for template validation
  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  /**
   * Fills demo account credentials into the form
   */
  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'alex.vance@electrohub.io',
      password: 'TechSecure2026!',
    });
    this.errorMessage.set(null);
  }

  /**
   * Immediately signs in as the demo user
   */
  loginWithDemoAccount(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const result = this.authService.loginAsDemoUser();
    this.isLoading.set(false);

    if (result.success) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/profile';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.errorMessage.set('Could not sign in with demo account.');
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;
    const result = this.authService.login(email, password);

    this.isLoading.set(false);

    if (result.success) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/profile';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.errorMessage.set(result.message || 'Invalid credentials provided.');
    }
  }
}
