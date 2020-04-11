import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { EntityId } from '../app.component';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'sidebar-navigation',
  templateUrl: './sidebar-navigation.component.html',
  styleUrls: ['./sidebar-navigation.component.scss']
})
export class SidebarNavigationComponent implements OnInit {
  private _activeReport: { reportId: EntityId };

  @ViewChild("sidenav", { static: false }) public sidenav: MatSidenav;

  @Input()
  set activeReport(activeReport: { reportId: EntityId }) {
    this._activeReport = activeReport;
  }

  public toggleSidenav() {
    this.sidenav.toggle();
  }

  get activeReport() {
    return this._activeReport;
  }

  constructor() { }

  ngOnInit() {
  }

}
