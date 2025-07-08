import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxFileUploaderModule } from 'devextreme-angular/ui/file-uploader';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxFileUploaderModule,
    DxLoadPanelModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
