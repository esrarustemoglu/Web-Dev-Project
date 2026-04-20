import { Injectable, signal } from '@angular/core';
import { Profile } from '../interfaces/profile';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = signal<boolean>(false);
  router: any;

  login() {
    this.isLoggedIn.set(true);
    this.router.navigate(['/profile']);
  }

  logout() {
    this.isLoggedIn.set(false);
    this.router.navigate(['/']); 
  }
}
