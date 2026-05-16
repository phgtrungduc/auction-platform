import { Component } from '@angular/core';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent extends BaseComponent {
  readonly currentYear = new Date().getFullYear();
  readonly aboutContactUrl = 'https://taisandaugia.lovable.app/gioi-thieu';
  readonly privacyPolicyUrl = 'https://taisandaugia.lovable.app/chinh-sach-bao-mat';
  readonly termsOfUseUrl = 'https://taisandaugia.lovable.app/dieu-khoan-su-dung';

  constructor() {
    super();
  }

  openExternalLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  openAboutContact(): void {
    this.openExternalLink(this.aboutContactUrl);
  }
}
