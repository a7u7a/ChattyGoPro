import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbMenuModule, NbSidebarModule, NbIconModule } from '@nebular/theme';
import { HomeComponent } from './home/home.component';
import { D3ChartComponent } from './d3-chart/d3-chart.component';
import { AreaChartComponent } from './area-chart/area-chart.component';
import { D3TimeSeriesComponent } from './d3-time-series/d3-time-series.component';
import { TimeSeriesWindowComponent } from './time-series-window/time-series-window.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    D3ChartComponent,
    AreaChartComponent,
    D3TimeSeriesComponent,
    TimeSeriesWindowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'dark' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
