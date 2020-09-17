import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbMenuModule, NbSidebarModule, NbIconModule } from '@nebular/theme';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { FocusParentComponent } from './focus-context-test/focus-parent/focus-parent.component';
import { FocusChildComponent } from './focus-context-test/focus-child/focus-child.component';
import { DataService } from './data.service'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FocusParentComponent,
    FocusChildComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbIconModule,
    HttpClientModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
