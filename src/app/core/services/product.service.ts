import { Injectable, signal, computed } from '@angular/core';
import { Product, ProductFilterCriteria } from '../models/product.model';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Signals for state management
  private readonly _products = signal<Product[]>([]);
  private readonly _categories = signal<Category[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _selectedProduct = signal<Product | null>(null);

  // Readonly signals exposed to consumers
  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();

  // Computed signals
  readonly featuredProducts = computed(() =>
    this._products().filter((p) => p.isFeatured)
  );

  readonly newArrivals = computed(() =>
    this._products().filter((p) => p.isNewArrival)
  );

  readonly bestSellers = computed(() =>
    this._products().filter((p) => p.isBestSeller)
  );

  constructor() {
    this.initializeDefaultData();
  }

  /**
   * Initializes initial mock electronics catalog for frontend-only architecture
   */
  private initializeDefaultData(): void {
    const defaultCategories: Category[] = [
      {
        id: 'cat-laptops',
        name: 'Laptops & Computers',
        slug: 'laptops-computers',
        description: 'High-performance workstations, ultrabooks, and gaming rigs.',
        icon: 'bi-laptop',
        featured: true,
        productCount: 12,
      },
      {
        id: 'cat-smartphones',
        name: 'Smartphones & Tablets',
        slug: 'smartphones-tablets',
        description: 'Flagship mobile devices with breakthrough cameras and displays.',
        icon: 'bi-phone',
        featured: true,
        productCount: 18,
      },
      {
        id: 'cat-audio',
        name: 'Audio & Acoustics',
        slug: 'audio-acoustics',
        description: 'Studio-grade headphones, wireless earbuds, and spatial soundbars.',
        icon: 'bi-headphones',
        featured: true,
        productCount: 15,
      },
      {
        id: 'cat-wearables',
        name: 'Smart Wearables',
        slug: 'smart-wearables',
        description: 'Next-gen fitness trackers, smartwatches, and biometric monitors.',
        icon: 'bi-smartwatch',
        featured: true,
        productCount: 8,
      },
      {
        id: 'cat-gaming',
        name: 'Gaming & VR',
        slug: 'gaming-vr',
        description: 'Next-gen consoles, VR headsets, mechanical gear, and peripherals.',
        icon: 'bi-controller',
        featured: true,
        productCount: 14,
      },
      {
        id: 'cat-accessories',
        name: 'Tech Accessories',
        slug: 'accessories',
        description: 'Fast chargers, Thunderbolt docks, ergonomic stands, and cables.',
        icon: 'bi-usb-symbol',
        featured: false,
        productCount: 22,
      },
    ];

    const defaultProducts: Product[] = [
      {
        id: 'prod-macbook-pro-m3',
        name: 'Apex Pro 16" Ultra Studio',
        slug: 'apex-pro-16-ultra-studio',
        description: 'Ultimate engineering beast with 16-Core Neural Engine, Liquid Retina XDR display with 120Hz ProMotion, and 36-hour sustained battery life.',
        shortDescription: 'Liquid Retina XDR, 32GB RAM, 1TB NVMe, Space Navy',
        price: 2499.99,
        originalPrice: 2699.99,
        discountPercentage: 7,
        rating: 4.9,
        reviewCount: 128,
        stock: 14,
        inStock: true,
        sku: 'EH-LAP-001',
        brand: 'ApexTech',
        categoryId: 'cat-laptops',
        categoryName: 'Laptops & Computers',
        featuredImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          Processor: 'Apex M3 Max 16-Core',
          RAM: '32GB Unified Memory',
          Storage: '1TB Ultra-Fast SSD',
          Display: '16.2" Mini-LED Liquid XDR (3456 x 2234)',
          Battery: '100Wh (~22 hours video)',
        },
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        tags: ['flagship', 'laptop', 'creator'],
        warranty: '2-Year Manufacturer Warranty',
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: 'prod-soundwave-pro-anc',
        name: 'AuraStudio Studio Wireless ANC Headphones',
        slug: 'aurastudio-wireless-anc-headphones',
        description: 'Audiophile planar magnetic drivers paired with dynamic hybrid active noise cancellation, lossless high-res LDAC streaming, and plush memory foam cushions.',
        shortDescription: 'Lossless LDAC, 45h Playtime, Spatial Audio, Titanium Grey',
        price: 349.99,
        originalPrice: 399.99,
        discountPercentage: 12,
        rating: 4.8,
        reviewCount: 245,
        stock: 28,
        inStock: true,
        sku: 'EH-AUD-002',
        brand: 'AuraSonic',
        categoryId: 'cat-audio',
        categoryName: 'Audio & Acoustics',
        featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          Driver: '40mm Titanium Planar Drivers',
          BatteryLife: '45 hours ANC on',
          Connectivity: 'Bluetooth 5.4, 3.5mm AUX, USB-C DAC',
          Weight: '260g',
        },
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        tags: ['audiophile', 'anc', 'wireless'],
        warranty: '1-Year Global Warranty',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'prod-titan-phone-16',
        name: 'OmniFlagship Nova 16 Pro 5G',
        slug: 'omniflagship-nova-16-pro-5g',
        description: 'Titanium aerospace enclosure with periscope zoom optical zoom, AMOLED LTPO 1-144Hz display, and 100W wireless charge technology.',
        shortDescription: '200MP Camera, 512GB, Ceramic Blue, Snapdragon 8 Gen 4',
        price: 1199.99,
        originalPrice: 1299.99,
        discountPercentage: 8,
        rating: 4.7,
        reviewCount: 89,
        stock: 20,
        inStock: true,
        sku: 'EH-PHN-003',
        brand: 'OmniTech',
        categoryId: 'cat-smartphones',
        categoryName: 'Smartphones & Tablets',
        featuredImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          Display: '6.8" 2K AMOLED 144Hz LTPO',
          Camera: '200MP Main + 50MP Periscope + 50MP Ultra-wide',
          Battery: '5400mAh with 100W HyperCharge',
          OS: 'OmniOS 16 (Android 16 Core)',
        },
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        tags: ['flagship', '5g', 'smartphone'],
        warranty: '2-Year Care Coverage',
        createdAt: '2026-02-10T00:00:00Z',
      },
      {
        id: 'prod-watch-ultra-sport',
        name: 'Vanguard Horizon Smartwatch Ultra',
        slug: 'vanguard-horizon-smartwatch-ultra',
        description: 'Rugged titanium chassis, sapphire crystal glass, dual-frequency GNSS, ECG & blood oxygen telemetry, water resistant to 100 meters.',
        shortDescription: 'Sapphire Glass, Titanium Case, 100m Water Resistance, 7-Day Battery',
        price: 499.99,
        originalPrice: 549.99,
        discountPercentage: 9,
        rating: 4.9,
        reviewCount: 312,
        stock: 42,
        inStock: true,
        sku: 'EH-WCH-004',
        brand: 'Vanguard',
        categoryId: 'cat-wearables',
        categoryName: 'Smart Wearables',
        featuredImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          CaseMaterial: 'Aerospace Grade 5 Titanium',
          Display: '1.96" Sapphire Crystal Always-On OLED (3000 nits)',
          Sensors: 'Optical Heart, ECG, SpO2, Skin Temp, Depth Gauge',
          Battery: 'Up to 7 days normal / 60h endurance mode',
        },
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        tags: ['wearable', 'sports', 'titanium'],
        warranty: '2-Year Warranty',
        createdAt: '2026-01-20T00:00:00Z',
      },
      {
        id: 'prod-gaming-rig-oc',
        name: 'Nexus Quantum Mechanical Keyboard Pro',
        slug: 'nexus-quantum-mechanical-keyboard-pro',
        description: 'Hot-swappable magnetic Hall-effect switches with rapid trigger technology, CNC aluminum casing, gasket mount, and per-key RGB backlighting.',
        shortDescription: 'Hall-Effect Switches, Rapid Trigger, Gasket Mount, Anodized Navy',
        price: 189.99,
        originalPrice: 219.99,
        discountPercentage: 14,
        rating: 4.9,
        reviewCount: 178,
        stock: 35,
        inStock: true,
        sku: 'EH-GAM-005',
        brand: 'Nexus Gaming',
        categoryId: 'cat-gaming',
        categoryName: 'Gaming & VR',
        featuredImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          Switches: 'Quantum Hall-Effect Rapid Trigger (0.1mm - 4.0mm)',
          PollingRate: '8000Hz Ultra-Low Latency',
          Connectivity: 'Tri-Mode: 2.4GHz Wireless, Bluetooth 5.3, USB-C',
          Keycaps: 'Double-Shot PBT Cherry Profile',
        },
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        tags: ['gaming', 'peripherals', 'mechanical'],
        warranty: '2-Year Hardware Warranty',
        createdAt: '2026-02-18T00:00:00Z',
      },
      {
        id: 'prod-dock-thunderbolt',
        name: 'Synapse 14-in-1 Thunderbolt 5 Pro Dock',
        slug: 'synapse-14-in-1-thunderbolt-5-pro-dock',
        description: 'Single-cable connectivity powering dual 8K 60Hz or triple 4K 144Hz displays, 140W host charging, 10Gbps Ethernet, and UHS-II SD card readers.',
        shortDescription: '140W Host Charging, Dual 8K Support, 10GbE LAN, Aluminum Heat Sink',
        price: 279.99,
        originalPrice: 299.99,
        discountPercentage: 7,
        rating: 4.6,
        reviewCount: 94,
        stock: 19,
        inStock: true,
        sku: 'EH-ACC-006',
        brand: 'Synapse',
        categoryId: 'cat-accessories',
        categoryName: 'Tech Accessories',
        featuredImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          Ports: '3x TB5, 4x USB-A 3.2, 2x USB-C 10Gbps, HDMI 2.1, DP 2.1, 10GbE',
          PowerDelivery: '140W Pass-through charging to host',
          Chassis: 'Solid milled aircraft aluminum with silent dissipation',
        },
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        tags: ['accessories', 'dock', 'thunderbolt'],
        warranty: '3-Year Manufacturer Warranty',
        createdAt: '2026-01-10T00:00:00Z',
      },
    ];

    this._categories.set(defaultCategories);
    this._products.set(defaultProducts);
  }

  // Service Methods
  getProductById(id: string): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this._products().find((p) => p.slug === slug);
  }

  getProductsByCategory(categoryId: string): Product[] {
    return this._products().filter((p) => p.categoryId === categoryId);
  }

  filterProducts(criteria: ProductFilterCriteria): Product[] {
    let result = [...this._products()];

    if (criteria.categoryId) {
      result = result.filter((p) => p.categoryId === criteria.categoryId);
    }
    if (criteria.brand) {
      result = result.filter((p) => p.brand.toLowerCase() === criteria.brand?.toLowerCase());
    }
    if (criteria.minPrice !== undefined) {
      result = result.filter((p) => p.price >= (criteria.minPrice ?? 0));
    }
    if (criteria.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= (criteria.maxPrice ?? Infinity));
    }
    if (criteria.inStockOnly) {
      result = result.filter((p) => p.inStock && p.stock > 0);
    }
    if (criteria.searchQuery && criteria.searchQuery.trim().length > 0) {
      const q = criteria.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (criteria.sortBy) {
      switch (criteria.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return result;
  }

  setSelectedProduct(product: Product | null): void {
    this._selectedProduct.set(product);
  }
}
