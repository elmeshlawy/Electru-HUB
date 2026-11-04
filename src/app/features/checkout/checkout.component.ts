import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { Address } from '../../core/models/address.model';
import { OrderItem, PaymentMethod } from '../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyFormatPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly orderService = inject(OrderService);
  readonly authService = inject(AuthService);

  readonly items = this.cartService.items;
  readonly summary = this.cartService.summary;

  isSubmitting = signal<boolean>(false);
  orderSuccess = signal<string | null>(null);

  checkoutForm: FormGroup = this.fb.group({
    firstName: [this.authService.currentUser()?.firstName ?? '', [Validators.required]],
    lastName: [this.authService.currentUser()?.lastName ?? '', [Validators.required]],
    email: [this.authService.currentUser()?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.authService.currentUser()?.phone ?? '', [Validators.required]],
    streetAddress: ['742 Evergreen Terrace', [Validators.required]],
    apartment: ['Suite 4B'],
    city: ['San Francisco', [Validators.required]],
    state: ['CA', [Validators.required]],
    postalCode: ['94107', [Validators.required]],
    country: ['United States', [Validators.required]],
    paymentMethod: ['credit_card', [Validators.required]],
  });

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.items().length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const val = this.checkoutForm.value;
    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      fullName: `${val.firstName} ${val.lastName}`,
      streetAddress: val.streetAddress,
      apartmentOrSuite: val.apartment,
      city: val.city,
      stateOrProvince: val.state,
      postalCode: val.postalCode,
      country: val.country,
      phoneNumber: val.phone,
    };

    const orderItems: OrderItem[] = this.items().map((ci) => ({
      productId: ci.productId,
      productName: ci.product.name,
      productImage: ci.product.featuredImage,
      unitPrice: ci.unitPrice,
      quantity: ci.quantity,
      lineTotal: ci.totalPrice,
    }));

    const userId = this.authService.currentUser()?.id ?? 'guest-user';
    const newOrder = this.orderService.placeOrder(
      userId,
      `${val.firstName} ${val.lastName}`,
      val.email,
      orderItems,
      shippingAddress,
      shippingAddress,
      val.paymentMethod as PaymentMethod,
      this.summary()
    );

    // Clear cart and display order completion
    this.cartService.clearCart();
    this.isSubmitting.set(false);
    this.orderSuccess.set(newOrder.orderNumber);
  }
}
