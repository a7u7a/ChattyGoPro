import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {HomeComponent} from './home/home.component';  
import { D3ChartComponent } from './d3-chart/d3-chart.component';
//import { D3TimeSeriesComponent } from './d3-time-series/d3-time-series.component';
import { LineContainerComponent } from './line-container/line-container.component';
import { SimpleZoomParentComponent } from './simple-zoom/simple-zoom-parent/simple-zoom-parent.component';
import { Zoom2ParentComponent } from './zoom2/zoom2-parent/zoom2-parent.component';
import { FocusParentComponent } from './focus-context-test/focus-parent/focus-parent.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule) }, 
  //{ path: '**', redirectTo:'home' }, // redirects to home when the path is empty or unknown
  { path: 'd3-chart', component: D3ChartComponent},
  //{ path: 'd3-time-series', component:D3TimeSeriesComponent },
  { path: 'multi-line', component: LineContainerComponent},
  { path: 'simple-zoom', component: SimpleZoomParentComponent},
  { path: 'zoom2', component: Zoom2ParentComponent },
  { path: 'focus1', component: FocusParentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

 