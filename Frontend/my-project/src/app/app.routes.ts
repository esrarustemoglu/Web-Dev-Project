import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Blog } from './components/blog/blog';
import { Contact } from './components/contact/contact';
import { Login } from './components/login/login';
import { Register } from './components/register/register';

export const routes: Routes = [
    {
        path: "",
        component: Home
    },
    {
        path: "blog",
        component: Blog
    },
    {
        path: "contact",
        component: Contact
    },
    {
        path: "login",
        component: Login
    },
    {
        path: "register",
        component: Register
    }

];
