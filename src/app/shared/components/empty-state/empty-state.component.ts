import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  readonly icon = input<string>('bi-inbox');
  readonly title = input<string>('No items found');
  readonly description = input<string>('We could not find anything matching your request.');
  readonly actionText = input<string | null>(null);
  readonly actionRoute = input<string | null>(null);

  readonly actionClicked = output<void>();

  onActionClick(): void {
    this.actionClicked.emit();
  }
}
