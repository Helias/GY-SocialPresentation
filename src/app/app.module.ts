import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KatexModule } from 'ng-katex';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CollapseModule,
    BrowserAnimationsModule,
    KatexModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
