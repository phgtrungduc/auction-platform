import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../../core/services/logger.service';

export interface PartnerCooperationForm {
  orgName: string;
  contactName: string;
  phone: string;
  email: string;
  province: string;
  notes: string;
}

@Component({
  selector: 'app-partner-cooperation-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-cooperation-popup.component.html',
  styleUrl: './partner-cooperation-popup.component.scss',
})
export class PartnerCooperationPopupComponent {
  private readonly logger = inject(LoggerService);

  isOpen = false;
  isSubmitting = false;
  isSuccess = false;
  submitted = false;

  form: PartnerCooperationForm = this.emptyForm();

  open(): void {
    this.submitted = false;
    this.isSuccess = false;
    this.isOpen = true;
  }

  close(): void {
    if (this.isSubmitting) return;
    this.isOpen = false;
    this.isSuccess = false;
    this.form = this.emptyForm();
    this.submitted = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.submitted = true;

    if (!this.isFormValid()) {
      this.logger.warn('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    this.isSubmitting = true;

    // Chưa có API — mô phỏng gửi thành công
    setTimeout(() => {
      this.isSubmitting = false;
      this.isSuccess = true;
    }, 600);
  }

  isFieldInvalid(field: keyof PartnerCooperationForm): boolean {
    if (!this.submitted) return false;
    if (field === 'notes') return false;
    const value = this.form[field].trim();
    if (field === 'email') {
      return !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    return !value;
  }

  private isFormValid(): boolean {
    const { orgName, contactName, phone, email, province } = this.form;
    return (
      !!orgName.trim() &&
      !!contactName.trim() &&
      !!phone.trim() &&
      !!province.trim() &&
      !!email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    );
  }

  private emptyForm(): PartnerCooperationForm {
    return {
      orgName: '',
      contactName: '',
      phone: '',
      email: '',
      province: '',
      notes: '',
    };
  }
}
