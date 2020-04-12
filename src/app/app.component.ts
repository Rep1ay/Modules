import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

export interface EntityId{
  reportId: string | number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  reason = '';
  activeReport: { reportId: EntityId};
  @ViewChild("sidenav", { static: false }) public sidenav: MatSidenav;

  public toggleSidenav() {
    this.sidenav.toggle();
  }

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }

  public setActiveReport(report:  { reportId: EntityId}) {
    this.activeReport = report;
  }
}
