import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
  } from '@angular/core';
import { Dashboard } from '../../models/dashboard';
import { DashboardChange } from '../../models/dashboard-change';
import { DashboardChangeType } from '../../models/dashboard-change-type';
import { DashboardNavigationService, JSON_UPLOAD_TIME } from '../../services/dashboard-navigation.service';
import { DashboardType } from '../../models/dashboard-type';
import { ValidationResult } from '../../models/validation-result';

@Component({
  selector: "c-md-sidebar-form-element",
  templateUrl: "sidebar-form-element.component.html",
  styleUrls: ["./sidebar-form-element.component.scss"]
})
export class SidebarFormElementComponent implements OnInit {
  /**
   * Whether the this component is visible for a user.
   */
  @Input() isFormShown: boolean;
  /**
   * Input element of a title of a dashboard.
   */
  @ViewChild("titleInput", { static: true }) titleInput: ElementRef;
  /**
   * Input element of a link of a dashboard.
   */
  @ViewChild("linkInput", { static: true }) linkInput: ElementRef;
  /**
   * Whether the title of a dashboard is valid.
   */
  public isTitleCorrect: boolean = true;
  /**
   * Whether the link of a dashboard is valid.
   */
  public isLinkCorrect: boolean = true;
  /**
   * Error under the title input element.
   */
  public titleErrorMessage: string;
  /**
   * Error under the link input element.
   */
  public linkErrorMessage: string;
  /**
   * Text inside of a save button.
   */
  public saveButtonKey: string;
  /**
   * Whether the dashboard is set to a main one.
   */
  public isCheckboxChecked: boolean = false;
  /**
   * Currently set application's theme.
   */
  // public theme: Theme;
  /**
   * Dictionary that contains all the translations in the application.
   */
  // public dictionary = mdLocalizationDictionary.MdProject;

  constructor(private dashboardsService: DashboardNavigationService) {}

  /**
   * Subscribe to dashboard and theme changes.
   */
  ngOnInit() {
    // this.themeService.theme.subscribe((value) => (this.theme = value));
    this.dashboardsService.onFormClosed.subscribe(() => this.resetToDefault());
    this.saveButtonKey = "this.dictionary.Save";
  }

  /**
   * Dynamically change the link based on title.
   */
  public changeLink(title: string) {
    this.linkInput.nativeElement.value = this.createLink(title);
    this.checkValues();
  }

  /**
   * Dynamically check if the values are correct. Set errors if not.
   */
  public checkValues() {
    const title = this.titleInput.nativeElement.value;
    const link = this.linkInput.nativeElement.value;
    const titleCheck = this.dashboardsService.checkTitle(title);
    const linkCheck = this.dashboardsService.checkLink(link);
    this.toggleErrors(titleCheck, linkCheck);
  }

  /**
   * Create the `Dashboard` object and send it to `DashboardService`.
   */
  public addDashboard() {
    this.checkValues();
    if (!this.isLinkCorrect || !this.isTitleCorrect) {
      return;
    }

    const title = this.titleInput.nativeElement.value;
    const link = this.linkInput.nativeElement.value;
    const dashboard: Dashboard = { title, link, isMain: this.isCheckboxChecked, type: DashboardType.Parent, children: [] };
    this.sendUpdate(dashboard);
  }

  /**
   * Closes the form element, return buttons and inputs to default value.
   */
  public closeForm() {
    this.dashboardsService.onFormClosed.next();
    this.resetToDefault();
  }

  /**
   * Encode characters and replace spaces with '-'.
   * @param title Title written by the user.
   */
  private createLink(title: string): string {
    return title.toLowerCase().replace(/\s/g, "-");
  }

  /**
   * Create DashboardChange and send the update to `DashboardService`.
   * @param dashboard Newly created dashboard.
   */
  private sendUpdate(dashboard: Dashboard) {
    const changes: DashboardChange = { current: dashboard, type: DashboardChangeType.Added };
    this.dashboardsService.updateDashboard(changes);
    this.saveButtonKey = "this.dictionary.Saving";
    // # TODO: Use CSS instead of setTimeout
    setTimeout(() => this.closeForm(), JSON_UPLOAD_TIME);
  }

  /**
   * Toggle errors on the input elements.
   */
  private toggleErrors(titleCheck: ValidationResult, linkCheck: ValidationResult) {
    this.isTitleCorrect = titleCheck.isValid;
    this.isLinkCorrect = linkCheck.isValid;
  }

  /**
   * Bring back all the values to default settings.
   */
  private resetToDefault() {
    this.isFormShown = false;
    this.isLinkCorrect = true;
    this.isTitleCorrect = true;
    this.isCheckboxChecked = false;
    this.titleInput.nativeElement.value = "";
    this.linkInput.nativeElement.value = "";
    this.saveButtonKey = "this.dictionary.Save";
  }
}
