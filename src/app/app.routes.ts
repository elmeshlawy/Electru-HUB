import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'ElectroHub — Premium Electronics & Modern Tech',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products.component').then(
        (m) => m.ProductsComponent
      ),
    title: 'Products Catalog | ElectroHub',
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent
      ),
    title: 'Product Details | ElectroHub',
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
    title: 'Shopping Cart | ElectroHub',
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then(
        (m) => m.WishlistComponent
      ),
    title: 'My Wishlist | ElectroHub',
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    title: 'Secure Checkout | ElectroHub',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'Sign In | ElectroHub',
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    title: 'Create Account | ElectroHub',
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    title: 'My Profile | ElectroHub',
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders.component').then(
        (m) => m.OrdersComponent
      ),
    title: 'My Orders | ElectroHub',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
