import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../core/base/base.component';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [ReactiveFormsModule],
})
export class LoginComponent extends BaseComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly logger: LoggerService,
  ) {
    super();
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) return;

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.logger.success('Đăng nhập thành công!');
          this.router.navigate(['/']);
        } else {
          this.logger.error('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
        this.isLoading = false;
      },
      error: () => {
        this.logger.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
        this.isLoading = false;
      },
    });
  }
}
