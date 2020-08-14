import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {HomeComponent} from './home/home.component';  

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule) }, // redirects to home when the path is empty
  { path: '**', redirectTo:'home' },]; // when the path is unknown

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

 