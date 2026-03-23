import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit, OnDestroy {
  constructor(private router: Router) { }

  ngOnInit(): void {
    document.body.classList.add('no-bg');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-bg');
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
