import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'cgi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [MatIconModule, RouterLink, RouterLinkActive, RouterOutlet],
})
export class HomeComponent {}
