import _ from "lodash";
import { Dashboard } from "../models/dashboard";
import { DashboardChange } from "../models/dashboard-change";
import { DashboardChangeType } from "../models/dashboard-change-type";
import { DashboardValueValidatorService } from "./dashboard-value-validator.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { Observable, Subject } from "rxjs";
import { Router } from "@angular/router";
import { ValidationResult } from "../models/validation-result";

/**
 * #TODO Magic Number. Approximately 1250 milliseconds it takes for JSON server to save and restart a report.
 */
export const JSON_UPLOAD_TIME = 1250;

@Injectable()
export class DashboardNavigationService {
  /**
   * Calls all dashboard elements to close their tooltip.
   */
  public onTooltipClose: Subject<boolean> = new Subject();
  /**
   * Emits an event after a Sidebar Form Element has been closed.
   */
  public onFormClosed: Subject<boolean> = new Subject();
  /**
   * Listens to any dashboards array changes.
   */
  public dashboardsChange = new Subject<Dashboard[]>();
  /**
   * Current collection of dashboards.
   */
  public dashboards: Dashboard[];
  /**
   * Basic options for HTTP header.
   */
  private readonly httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    }),
  };
  /**
   * URL address to JSON server, where all the configurations are stored.
   */
  private readonly reportUrl: string;
  /**
   * Direct URL address to dashboards configuration stored on JSON server.
   */
  private readonly dashboardsUrl: string;
  reportsUrl = "http://localhost:3000";
  constructor(
    private http: HttpClient,
    private router: Router,
    private validator: DashboardValueValidatorService
  ) {
    this.reportUrl = this.reportsUrl;
    this.dashboardsUrl = `${this.reportUrl}/dashboards`;
  }

  /**
   * Create new report, by sending a request to an empty report.
   */
  public addReport(report: any): Observable<object> {
    return this.http.put(`${this.reportUrl}/empty`, report, this.httpOptions);
  }

  /**
   * Rename the report, by changing the id/link.
   */
  public renameReport(oldLink: string, newLink: string): Observable<object> {
    return this.http.put(
      `${this.reportUrl}/${oldLink}`,
      { link: newLink },
      this.httpOptions
    );
  }

  /**
   * Remove the report, which in fact will only move it to 'delete' directory.
   */
  public deleteReport(link: string): Observable<object> {
    return this.http.delete(`${this.reportUrl}/${link}`, this.httpOptions);
  }

  /**
   * Get the current collection of dashboards from the JSON server.
   */
  public getDashboards(): Observable<Dashboard[]> {
    let headerJson = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const headers = new HttpHeaders(headerJson);
    return this.http
      .get<any>(this.dashboardsUrl, this.httpOptions)
      .pipe(map((response) => this.mapDashboardsResponse(response)));
  }

  /**
   * Flatten the dashboard before updating the configuration by removing children's array.
   */
  public updateDashboards(report: any): Observable<Dashboard[]> {
    this.dashboards = report.dashboards;
    report.dashboards = report.dashboards.map((dashboard: Dashboard) => {
      return {
        link: dashboard.link,
        title: dashboard.title,
        isMain: dashboard.isMain,
        type: dashboard.type,
        parent: dashboard.parent,
      };
    });
    return this.http.put<Dashboard[]>(
      this.dashboardsUrl,
      report,
      this.httpOptions
    );
  }

  /**
   * Update the dashboard based on user's change.
   */
  public updateDashboard(changes: DashboardChange) {
    switch (changes.type) {
      case DashboardChangeType.Renamed:
        this.onDashboardTitleChanged(changes);
        break;
      case DashboardChangeType.SelectedMain:
        this.onDashboardFavoriteChanged(changes);
        break;
      case DashboardChangeType.Added:
        this.onDashboardAdded(changes);
        break;
      case DashboardChangeType.Deleted:
        this.onDashboardDelete(changes);
        break;
    }

    this.prepareUpdate(changes);
  }

  /**
   * Validate the link of a dashboard.
   */
  public checkLink(link: string): ValidationResult {
    return this.validator.checkLink(link, this.dashboards);
  }

  /**
   * Validate the title of a dashboard.
   */
  public checkTitle(title: string): ValidationResult {
    return this.validator.checkTitle(title, this.dashboards);
  }

  /**
   * Emit an event to every `DashboardNavigationElement` to close its tooltip.
   */
  public closeTooltips() {
    this.onTooltipClose.next();
  }

  /**
   * Whether the current dashboard is open
   */
  public isDashboardActive(link: string): boolean {
    return this.router.url.split("/").pop() === link;
  }

  /**
   * Create a configuration and send the update to JSON server.
   */
  private prepareUpdate(changes: DashboardChange) {
    const update = { id: "dashboards", dashboards: this.dashboards };
    this.flatDashboards();

    //FIXME Dashboard can't be opened right after the creation. Json server needs to process it.
    if (changes.type === DashboardChangeType.Added) {
      setTimeout(
        () => this.dashboardsChange.next(this.dashboards),
        JSON_UPLOAD_TIME
      );
    } else {
      this.dashboardsChange.next(this.dashboards);
    }

    this.sendUpdate(changes, update);
  }

  /**
   * First remove the report and then update the configuration on data removal.
   */
  private sendUpdate(changes: DashboardChange, update: any) {
    if (changes.type === DashboardChangeType.Deleted) {
      this.deleteReport(changes.current.link).subscribe(() =>
        this.updateDashboards(update).subscribe()
      );
    } else {
      this.updateDashboards(update).subscribe();
    }
  }

  /**
   * Rename title of the dashboard and update the children's parent reference.
   */
  private onDashboardTitleChanged(changes: DashboardChange) {
    this.dashboards.find(
      (dashboard) => dashboard.title === changes.previous.title
    ).title = changes.current.title;
    this.dashboards = this.dashboards.map((dashboard) => {
      const parent =
        dashboard.parent === changes.previous.link
          ? changes.current.link
          : dashboard.parent;
      return parent !== undefined ? { ...dashboard, parent } : dashboard;
    });
    this.onDashboardLinkChanged(changes);
  }

  /**
   * Rename link of the dashboard and send the change to server.
   */
  private onDashboardLinkChanged(changes: DashboardChange) {
    this.renameReport(changes.previous.link, changes.current.link).subscribe();
    this.dashboards.find(
      (dashboard) => dashboard.link === changes.previous.link
    ).link = changes.current.link;
  }

  /**
   * Change currently favorite dashboard.
   */
  private onDashboardFavoriteChanged(changes: DashboardChange) {
    this.dashboards.forEach((dashboard) => {
      dashboard.isMain = dashboard.link === changes.current.link;
    });
  }

  /**
   * Assign the dashboards array and return it right away.
   */
  private mapDashboardsResponse(response: any): Dashboard[] {
    this.dashboards = response;
    return this.dashboards;
  }

  /**
   * Create new report, add it to array and send the change to server.
   */
  private onDashboardAdded(changes: DashboardChange) {
    if (changes.current.isMain) {
      this.dashboards.map((dashboard) => (dashboard.isMain = false));
    }

    this.dashboards.push(changes.current);

    // const emptyReportJSON = createEmptyReport(changes.current.link);

    // this.addReport(emptyReportJSON).subscribe();
  }

  /**
   * Remove the dashboard from an array, change the current location if user removed current report.
   */
  private onDashboardDelete(changes: DashboardChange) {
    this.removeDashboard(changes.current.link);

    if (changes.current.isMain) {
      this.dashboards[0].isMain = true;
    }

    if (this.router.url === `/report/${changes.current.link}`) {
      const mainDashboard = this.dashboards.find(
        (dashboard: Dashboard) => dashboard.isMain
      );
      this.router.navigateByUrl(`/report/${mainDashboard.link}`);
    }
  }

  /**
   * Remove the dashboard and it's children.
   * @param link Link of the dashboard that should be deleted.
   * @param dashboards Array of dashboards to search in. Could be children or just `dashboards`.
   */
  private removeDashboard(link: string) {
    const removedChildren = [];
    this.dashboards = this.dashboards
      .filter((dashboard) => {
        if (dashboard.parent === link) {
          removedChildren.push(dashboard.link);
        }
        return dashboard.link !== link && dashboard.parent !== link;
      })
      .filter((dashboard) => !removedChildren.includes(dashboard.parent));
  }

  /**
   * Remove children from the dashboards. Bring them all to the same level.
   */
  private flatDashboards() {
    this.dashboards = this.dashboards.map((dashboard) => {
      return { ...dashboard, children: [] };
    });
  }
}
