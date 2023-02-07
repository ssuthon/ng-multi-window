import { InjectionToken, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';
import {DialogService, DynamicDialogModule} from 'primeng/dynamicdialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MegaMenuModule} from 'primeng/megamenu';
import {DropdownModule} from 'primeng/dropdown';

import { AppComponent } from './app.component';
import { FooComponent } from './components/foo/foo.component';
import { WindowService } from './window.service';

const APP_WINDOW_REGISTRY:{[key: string]: Type<any>} = {
  foo: FooComponent
}

export const WINDOW_REGISTRY = new InjectionToken<{[key: string]: Type<any>}>('app.windowRegistry');

@NgModule({
  declarations: [
    AppComponent,
    FooComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DynamicDialogModule,
    MegaMenuModule,
    DropdownModule,
    FormsModule,
  ],
  providers: [
    DialogService,
    {provide: WINDOW_REGISTRY, useValue: APP_WINDOW_REGISTRY}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
