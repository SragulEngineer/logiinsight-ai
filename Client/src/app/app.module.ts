import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './features/dashboard/dashboard.component';

@NgModule({
  declarations: [
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DashboardComponent
],
  providers: [],
  bootstrap: []
})
export class AppModule { }
