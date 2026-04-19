import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validator } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Profile } from '../../interfaces/profile';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
