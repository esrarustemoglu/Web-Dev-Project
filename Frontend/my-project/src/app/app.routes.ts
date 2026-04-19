import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Blog } from './components/blog/blog';
import { Contact } from './components/contact/contact';

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
    }
];
