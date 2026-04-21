import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const access = localStorage.getItem('access');
  if (access) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
