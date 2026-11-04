import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/profile' } as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        StorageService,
        {
          provide: Router,
          useValue: {
            createUrlTree: (commands: any[], extras?: any) => ({
              commands,
              extras,
              toString: () => `${commands.join('/')}?returnUrl=${extras?.queryParams?.returnUrl || ''}`,
            }),
          },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    authService.logout();
  });

  afterEach(() => {
    authService.logout();
  });

  it('should redirect unauthenticated users to /auth/login with returnUrl query param', () => {
    expect(authService.isAuthenticated()).toBe(false);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(typeof result).toBe('object');
    const urlTree = result as any;
    expect(urlTree.commands).toEqual(['/auth/login']);
    expect(urlTree.extras.queryParams.returnUrl).toBe('/profile');
  });

  it('should allow access (return true) when user is authenticated', () => {
    authService.loginAsDemoUser();
    expect(authService.isAuthenticated()).toBe(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
    expect(result).toBe(true);
  });
});
