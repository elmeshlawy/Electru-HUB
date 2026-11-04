import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { OrderStatus } from '../../core/models/order.model';
import { handleImageFallback } from '../../shared/constants/image.constants';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, EmptyStateComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent {
  readonly orderService = inject(OrderService);

  readonly orders = this.orderService.orders;

  expandedOrderId = signal<string | null>(null);
  feedbackMessage = signal<string | null>(null);

  toggleOrderDetails(orderId: string): void {
    this.expandedOrderId.update((curr) => (curr === orderId ? null : orderId));
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrderId() === orderId;
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'delivered':
        return 'bg-success-subtle text-success';
      case 'shipped':
        return 'bg-primary-subtle text-primary';
      case 'processing':
        return 'bg-info-subtle text-info';
      case 'pending':
        return 'bg-warning-subtle text-warning';
      case 'cancelled':
        return 'bg-danger-subtle text-danger';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  onImageError(event: Event): void {
    handleImageFallback(event);
  }

  cancelOrder(orderId: string): void {
    const success = this.orderService.cancelOrder(orderId);
    if (success) {
      this.feedbackMessage.set('Order has been successfully cancelled.');
      setTimeout(() => this.feedbackMessage.set(null), 3500);
    }
  }
}
