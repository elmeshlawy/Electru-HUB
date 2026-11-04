import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { Address } from '../../core/models/address.model';
import { Order, OrderItem, PaymentMethod } from '../../core/models/order.model';
import { CartSummary } from '../../core/models/cart.model';

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  cost: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyFormatPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  readonly orderService = inject(OrderService);
  readonly authService = inject(AuthService);

  readonly items = this.cartService.cartItems;
  readonly cartSubtotal = this.cartService.subtotal;

  isSubmitting = signal<boolean>(false);
  confirmedOrder = signal<Order | null>(null);

  // Available shipping methods
  readonly shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Reliable ground courier delivery',
      estimatedDays: '3-5 Business Days',
      cost: 0, // Calculated dynamically based on free shipping threshold
    },
    {
      id: 'express',
      name: 'Express Air Shipping',
      description: 'Expedited air courier dispatch',
      estimatedDays: '1-2 Business Days',
      cost: 25,
    },
    {
      id: 'priority',
      name: 'Next-Day Priority',
      description: 'Guaranteed next morning delivery',
      estimatedDays: 'Next Business Day',
      cost: 35,
    },
  ];

  selectedShippingMethodId = signal<string>('standard');

  // Dynamic shipping cost computation
  readonly currentShippingCost = computed(() => {
    const methodId = this.selectedShippingMethodId();
    if (methodId === 'express') return 25;
    if (methodId === 'priority') return 35;
    // Standard shipping
    const sub = this.cartSubtotal();
    if (sub === 0) return 0;
    return sub >= this.cartService.freeShippingThreshold ? 0 : this.cartService.standardShippingFee;
  });

  // Estimated tax (8%)
  readonly currentTax = computed(() =>
    Math.round(this.cartSubtotal() * 0.08 * 100) / 100
  );

  // Grand total
  readonly currentTotal = computed(() =>
    Math.round((this.cartSubtotal() + this.currentShippingCost() + this.currentTax()) * 100) / 100
  );

  checkoutForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    streetAddress: ['', [Validators.required, Validators.minLength(5)]],
    apartment: [''],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.minLength(3)]],
    country: ['United States', [Validators.required]],
    shippingMethod: ['standard', [Validators.required]],
    paymentMethod: ['credit_card', [Validators.required]],

    // Simulated card fields (UI only, never stored)
    cardholderName: [''],
    cardNumber: [''],
    cardExpiry: [''],
    cardCvc: [''],
  });

  constructor() {
    this.prepopulateFromUserProfile();

    // Listen to shipping method changes
    this.checkoutForm.get('shippingMethod')?.valueChanges.subscribe((val) => {
      if (val) {
        this.selectedShippingMethodId.set(val);
      }
    });
  }

  // Helper getters for template validation
  get f() {
    return this.checkoutForm.controls;
  }

  private prepopulateFromUserProfile(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const defaultAddr = user.addresses?.find((a) => a.isDefaultShipping) || user.addresses?.[0];

    this.checkoutForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || defaultAddr?.phoneNumber || '',
      streetAddress: defaultAddr?.streetAddress || '742 Evergreen Terrace',
      apartment: defaultAddr?.apartmentOrSuite || 'Suite 4B',
      city: defaultAddr?.city || 'San Francisco',
      state: defaultAddr?.stateOrProvince || 'CA',
      postalCode: defaultAddr?.postalCode || '94107',
      country: defaultAddr?.country || 'United States',
      cardholderName: `${user.firstName} ${user.lastName}`.trim(),
    });
  }

  onShippingMethodChange(methodId: string): void {
    this.selectedShippingMethodId.set(methodId);
    this.checkoutForm.patchValue({ shippingMethod: methodId });
  }

  onPaymentMethodChange(method: PaymentMethod): void {
    this.checkoutForm.patchValue({ paymentMethod: method });
  }

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

    const selectedOption =
      this.shippingOptions.find((o) => o.id === val.shippingMethod) || this.shippingOptions[0];
    const shippingMethodLabel = `${selectedOption.name} (${selectedOption.estimatedDays})`;

    const customSummary: CartSummary = {
      subtotal: this.cartSubtotal(),
      shipping: this.currentShippingCost(),
      tax: this.currentTax(),
      discount: 0,
      total: this.currentTotal(),
      totalItems: this.cartService.totalItems(),
    };

    const userId = this.authService.currentUser()?.id ?? 'guest-customer';

    // Place the order into OrderService (persisted to LocalStorage)
    const newOrder = this.orderService.placeOrder(
      userId,
      `${val.firstName} ${val.lastName}`,
      val.email,
      orderItems,
      shippingAddress,
      shippingAddress,
      val.paymentMethod as PaymentMethod,
      customSummary,
      shippingMethodLabel
    );

    // Clear shopping cart upon successful confirmation
    this.cartService.clearCart();

    this.isSubmitting.set(false);
    this.confirmedOrder.set(newOrder);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
