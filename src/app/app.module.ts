import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { DemoMaterialModule } from "./modules/material-module";
import { SidebarNavigationComponent } from "./sidebar-navigation/sidebar-navigation.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { HomeComponent } from "./home/home.component";
import { DashboardElementComponent } from "./sidebar-navigation/dashboard-element/dashboard-element.component";
import { SidebarFormElementComponent } from "./sidebar-navigation/sidebar-form-element/sidebar-form-element.component";
import { DashboardNavigationService } from "./services/dashboard-navigation.service";
import { DashboardValueValidatorService } from "./services/dashboard-value-validator.service";

const COMPONENTS = [
  SidebarNavigationComponent,
  DashboardElementComponent,
  SidebarFormElementComponent,
];

@NgModule({
  declarations: [
    AppComponent,
    SidebarNavigationComponent,
    DashboardElementComponent,
    SidebarFormElementComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    DemoMaterialModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [DashboardNavigationService, DashboardValueValidatorService],
  bootstrap: [AppComponent],
  exports: [COMPONENTS],
  entryComponents: [COMPONENTS],
})
export class AppModule {}
