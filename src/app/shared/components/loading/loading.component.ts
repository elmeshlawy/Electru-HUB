import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent {
  readonly message = input<string>('Loading catalog...');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly fullscreen = input<boolean>(false);
}
