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

  readonly bestSellers = computed(() =>
    this._products().filter((p) => p.isBestSeller)
  );

  readonly newArrivals = computed(() =>
    this._products().filter((p) => p.isNewArrival)
  );

  readonly onSaleProducts = computed(() =>
    this._products().filter((p) => (p.discountPercentage ?? 0) > 0)
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
        name: 'Laptops',
        slug: 'laptops',
        description: 'High-performance workstations, ultrabooks, and creator powerhouses.',
        icon: 'bi-laptop',
        featured: true,
        productCount: 12,
      },
      {
        id: 'cat-smartphones',
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Flagship titanium mobile devices with breakthrough cameras and displays.',
        icon: 'bi-phone',
        featured: true,
        productCount: 16,
      },
      {
        id: 'cat-headphones',
        name: 'Headphones',
        slug: 'headphones',
        description: 'Audiophile planar magnetic acoustics, studio monitors, and wireless ANC.',
        icon: 'bi-headphones',
        featured: true,
        productCount: 14,
      },
      {
        id: 'cat-gaming',
        name: 'Gaming',
        slug: 'gaming',
        description: 'Rapid-trigger mechanical keyboards, precision mice, and esports gear.',
        icon: 'bi-controller',
        featured: true,
        productCount: 18,
      },
      {
        id: 'cat-monitors',
        name: 'Monitors',
        slug: 'monitors',
        description: 'Ultra-wide curved QD-OLED displays and factory-calibrated 5K screens.',
        icon: 'bi-display',
        featured: true,
        productCount: 10,
      },
      {
        id: 'cat-accessories',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Thunderbolt 5 docks, multi-device GaN chargers, and ergonomic mounts.',
        icon: 'bi-usb-symbol',
        featured: true,
        productCount: 24,
      },
    ];

    const defaultProducts: Product[] = [
      // 1. Laptops
      {
        id: 'prod-macbook-pro-m3',
        name: 'Apex Pro 16" Ultra Studio',
        slug: 'apex-pro-16-ultra-studio',
        description: 'Ultimate engineering workstation with 16-Core Neural Engine, Liquid Retina XDR display with 120Hz ProMotion, and 36-hour sustained battery life.',
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
        categoryName: 'Laptops',
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
        isNewArrival: false,
        isBestSeller: true,
        tags: ['flagship', 'laptop', 'creator'],
        warranty: '2-Year Manufacturer Warranty',
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: 'prod-zephyr-blade-14',
        name: 'Zephyr Blade 14" Slim Ultrabook',
        slug: 'zephyr-blade-14-slim-ultrabook',
        description: 'Ultra-thin magnesium CNC chassis packing Ryzen AI 9 processor, 2.8K 120Hz OLED screen, and dedicated vapor-chamber thermal design.',
        shortDescription: '2.8K OLED 120Hz, Ryzen AI 9, 32GB LPDDR5X, 1.29kg',
        price: 1749.99,
        originalPrice: 1999.99,
        discountPercentage: 12,
        rating: 4.8,
        reviewCount: 76,
        stock: 19,
        inStock: true,
        sku: 'EH-LAP-002',
        brand: 'Zephyr',
        categoryId: 'cat-laptops',
        categoryName: 'Laptops',
        featuredImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          Processor: 'Ryzen AI 9 365 (10-Core / 20-Thread)',
          RAM: '32GB LPDDR5X-7500',
          Storage: '1TB PCIe Gen 4 SSD',
          Display: '14" 2.8K OLED (2880 x 1800), 120Hz, 100% DCI-P3',
          Weight: '1.29 kg (2.84 lbs)',
        },
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        tags: ['ultrabook', 'laptop', 'slim'],
        warranty: '2-Year Warranty',
        createdAt: '2026-02-05T00:00:00Z',
      },

      // 2. Smartphones
      {
        id: 'prod-titan-phone-16',
        name: 'OmniFlagship Nova 16 Pro 5G',
        slug: 'omniflagship-nova-16-pro-5g',
        description: 'Aerospace-grade titanium enclosure with periscope optical zoom, AMOLED LTPO 1-144Hz display, and 100W wireless charge technology.',
        shortDescription: '200MP Camera, 512GB, Ceramic Blue, Snapdragon 8 Gen 4',
        price: 1199.99,
        originalPrice: 1299.99,
        discountPercentage: 8,
        rating: 4.7,
        reviewCount: 89,
        stock: 20,
        inStock: true,
        sku: 'EH-PHN-001',
        brand: 'OmniTech',
        categoryId: 'cat-smartphones',
        categoryName: 'Smartphones',
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
        isBestSeller: true,
        tags: ['flagship', '5g', 'smartphone'],
        warranty: '2-Year Care Coverage',
        createdAt: '2026-02-10T00:00:00Z',
      },
      {
        id: 'prod-vortex-ultrafold-5g',
        name: 'Vortex UltraFold Dual Display 5G',
        slug: 'vortex-ultrafold-dual-display-5g',
        description: 'Zero-gap titanium water-drop hinge unfolding into a breathtaking 7.8-inch 120Hz canvas with stylus support and triple flagship sensor array.',
        shortDescription: '7.8" Foldable AMOLED, 512GB, Triple 50MP, Phantom Black',
        price: 1699.99,
        originalPrice: 1899.99,
        discountPercentage: 11,
        rating: 4.8,
        reviewCount: 52,
        stock: 12,
        inStock: true,
        sku: 'EH-PHN-002',
        brand: 'Vortex',
        categoryId: 'cat-smartphones',
        categoryName: 'Smartphones',
        featuredImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          MainDisplay: '7.82" Foldable LTPO OLED (2440 x 2268), 120Hz',
          CoverDisplay: '6.31" OLED 120Hz (2484 x 1116)',
          Memory: '16GB RAM + 512GB Storage',
          Battery: '4805mAh with 67W SuperVOOC',
        },
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        tags: ['foldable', '5g', 'smartphone'],
        warranty: '2-Year VIP Screen Care',
        createdAt: '2026-02-15T00:00:00Z',
      },

      // 3. Headphones
      {
        id: 'prod-soundwave-pro-anc',
        name: 'AuraStudio Wireless ANC Headphones',
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
        sku: 'EH-AUD-001',
        brand: 'AuraSonic',
        categoryId: 'cat-headphones',
        categoryName: 'Headphones',
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
        id: 'prod-sonicpulse-air-pro',
        name: 'SonicPulse Air Pro Wireless Earbuds',
        slug: 'sonicpulse-air-pro-wireless-earbuds',
        description: 'True wireless spatial audio earbuds with dual drivers, personalized ear canal scanning, adaptive noise cancellation, and wireless charging case.',
        shortDescription: 'Active Noise Cancellation, 36h Playtime, IPX5, Wireless Case',
        price: 199.99,
        originalPrice: 249.99,
        discountPercentage: 20,
        rating: 4.7,
        reviewCount: 164,
        stock: 45,
        inStock: true,
        sku: 'EH-AUD-002',
        brand: 'SonicPulse',
        categoryId: 'cat-headphones',
        categoryName: 'Headphones',
        featuredImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          Drivers: '11mm Dynamic + Balanced Armature',
          NoiseCancellation: 'Up to 48dB Adaptive Hybrid ANC',
          BatteryLife: '9h earbuds / 36h total with Qi case',
          WaterResistance: 'IPX5 Sweat & Water Resistant',
        },
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        tags: ['earbuds', 'anc', 'wireless'],
        warranty: '1-Year Warranty',
        createdAt: '2026-02-12T00:00:00Z',
      },

      // 4. Gaming
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
        sku: 'EH-GAM-001',
        brand: 'Nexus Gaming',
        categoryId: 'cat-gaming',
        categoryName: 'Gaming',
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
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        tags: ['gaming', 'peripherals', 'mechanical'],
        warranty: '2-Year Hardware Warranty',
        createdAt: '2026-01-18T00:00:00Z',
      },
      {
        id: 'prod-hyperion-mouse-pro',
        name: 'Hyperion Precision Wireless Esports Mouse',
        slug: 'hyperion-precision-wireless-esports-mouse',
        description: 'Ultra-lightweight 54g magnesium honeycomb chassis with 42,000 DPI optical sensor, optical switches, and 8,000Hz wireless polling rate dongle.',
        shortDescription: '54g Featherweight, 42K DPI Sensor, 8000Hz Wireless Polling',
        price: 129.99,
        originalPrice: 149.99,
        discountPercentage: 13,
        rating: 4.9,
        reviewCount: 110,
        stock: 40,
        inStock: true,
        sku: 'EH-GAM-002',
        brand: 'Hyperion',
        categoryId: 'cat-gaming',
        categoryName: 'Gaming',
        featuredImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          Sensor: 'HyperSense 42K Gen 3 Optical',
          PollingRate: 'True 8000Hz Wireless & Wired',
          Weight: '54 grams without cable',
          BatteryLife: 'Up to 90 hours at 1000Hz',
        },
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        tags: ['gaming', 'mouse', 'esports'],
        warranty: '2-Year Warranty',
        createdAt: '2026-02-08T00:00:00Z',
      },

      // 5. Monitors
      {
        id: 'prod-apex-horizon-34',
        name: 'Apex Horizon 34" Curved QD-OLED Monitor',
        slug: 'apex-horizon-34-curved-qd-oled-monitor',
        description: 'Immersive 1800R curved Quantum-Dot OLED display delivering true 0.03ms response time, 175Hz refresh rate, 99.3% DCI-P3 color gamut, and DisplayHDR True Black 400.',
        shortDescription: '34" Curved 3440x1440, QD-OLED, 175Hz 0.03ms, HDR1000',
        price: 999.99,
        originalPrice: 1199.99,
        discountPercentage: 17,
        rating: 4.9,
        reviewCount: 95,
        stock: 15,
        inStock: true,
        sku: 'EH-MON-001',
        brand: 'ApexTech',
        categoryId: 'cat-monitors',
        categoryName: 'Monitors',
        featuredImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          PanelType: '34" QD-OLED (Quantum Dot OLED)',
          Resolution: 'UWQHD (3440 x 1440), 21:9 Aspect Ratio',
          RefreshRate: '175Hz Native with 0.03ms GtG',
          ColorAccuracy: '99.3% DCI-P3 / Delta E < 2',
          Ports: '2x DP 1.4, 1x HDMI 2.1, USB-C 90W PD, USB Hub',
        },
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        tags: ['monitor', 'curved', 'oled', 'gaming'],
        warranty: '3-Year Burn-In Warranty Coverage',
        createdAt: '2026-01-25T00:00:00Z',
      },
      {
        id: 'prod-proart-studioview-32',
        name: 'ProArt StudioView 32" 5K UHD Monitor',
        slug: 'proart-studioview-32-5k-uhd-monitor',
        description: 'Reference studio display calibrated for filmmakers and visual engineers with 5120 x 2880 resolution, built-in motorized colorimeter, and 96W Thunderbolt 4 pass-through.',
        shortDescription: '32" 5K 5120x2880, Built-in Calibrator, 96W Thunderbolt 4',
        price: 1399.99,
        originalPrice: 1549.99,
        discountPercentage: 10,
        rating: 4.8,
        reviewCount: 42,
        stock: 8,
        inStock: true,
        sku: 'EH-MON-002',
        brand: 'ProArt',
        categoryId: 'cat-monitors',
        categoryName: 'Monitors',
        featuredImage: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          PanelType: '32" IPS Black Nano-Coated',
          Resolution: '5K UHD (5120 x 2880) at 60Hz',
          ColorAccuracy: '100% sRGB, 99% Adobe RGB, 98% DCI-P3',
          Connectivity: 'Thunderbolt 4 (96W Power Delivery, Daisy-chain)',
        },
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        tags: ['monitor', 'creator', '5k', 'thunderbolt'],
        warranty: '3-Year Zero Bright Dot Warranty',
        createdAt: '2026-02-14T00:00:00Z',
      },

      // 6. Accessories
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
        sku: 'EH-ACC-001',
        brand: 'Synapse',
        categoryId: 'cat-accessories',
        categoryName: 'Accessories',
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
        isBestSeller: true,
        tags: ['accessories', 'dock', 'thunderbolt'],
        warranty: '3-Year Manufacturer Warranty',
        createdAt: '2026-01-10T00:00:00Z',
      },
      {
        id: 'prod-magcharge-3in1-gan',
        name: 'MagCharge 3-in-1 GaN Rapid Wireless Station',
        slug: 'magcharge-3in1-gan-rapid-wireless-station',
        description: 'Premium zinc alloy folding wireless stand powering phone at 15W Qi2, smartwatch fast charge, and earbuds simultaneously with intelligent temperature governance.',
        shortDescription: 'Qi2 15W Fast Charge, Zinc Alloy Foldable, Phone + Watch + Buds',
        price: 119.99,
        originalPrice: 149.99,
        discountPercentage: 20,
        rating: 4.8,
        reviewCount: 132,
        stock: 38,
        inStock: true,
        sku: 'EH-ACC-002',
        brand: 'MagCharge',
        categoryId: 'cat-accessories',
        categoryName: 'Accessories',
        featuredImage: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80',
        ],
        specs: {
          ChargingStandards: 'Official Qi2 15W, Made For Apple Watch Fast Charge',
          Material: 'Anodized CNC Aluminum & Soft-touch Vegan Silicone',
          PowerInput: '65W USB-C GaN Wall Adapter included',
        },
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        tags: ['accessories', 'wireless', 'charger'],
        warranty: '2-Year Warranty',
        createdAt: '2026-02-16T00:00:00Z',
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
