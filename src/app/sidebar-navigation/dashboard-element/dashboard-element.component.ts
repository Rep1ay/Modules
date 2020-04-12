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
import { DashboardNavigationService } from '../../services/dashboard-navigation.service';
import { DashboardType } from '../../models/dashboard-type';
import { Router } from '@angular/router';

@Component({
  selector: "dashboard-element",
  templateUrl: "dashboard-element.component.html",
  styleUrls: ["./dashboard-element.component.scss"]
})
export class DashboardElementComponent implements OnInit {
  /**
   * Input element for title edit.
   */
  @ViewChild("editInput", { static: false }) input: ElementRef;
  /**
   * Whether the dashboard currently open is this one.
   */
  @Input() isActive: boolean;
  /**
   * Whether to enable different styling for drag mode.
   */
  @Input() isDragModeOn: boolean;
  /**
   * Dashboard configuration.
   */
  @Input() dashboard: Dashboard;
  /**
   * String representation of `DragPosition` sent from the `SidebarNavigationComponent`.
   */
  @Input() style: string;
  /**
   * Whether to enable the trash icon and disables the pencil icon. Hides the tooltip on set.
   */
  @Input()
  set isDeleteModeOn(value: boolean) {
    this._isDeleteModeOn = value;
    this.isTooltipEnabled = false;
  }
  get isDeleteModeOn(): boolean {
    return this._isDeleteModeOn;
  }
  /**
   * Current application's theme.
   */
  // public theme: Theme;
  /**
   * Whether to show tool-top element.
   */
  public isTooltipEnabled: boolean;
  /**
   * Whether to change span into a input element.
   */
  public isEditModeOn: boolean;
  /**
   * Information for the user about current state.
   */
  public tooltipMessage: string;
  /**
   * Whether the new title user wrote is valid.
   */
  public isTitleValid: boolean = true;
  /**
   * Error message displayed inside of the tool-tip element.
   */
  public errorMessage: string;
  /**
   * Margin of the element provided by the parent component.
   */
  public margin: number;
  /**
   * Dictionary that contains all the translations in the application.
   */
  // public dictionary = mdLocalizationDictionary.MdProject;
  /**
   * Whether to enable the trash icon and disables the pencil icon. Hides the tooltip on set.
   */
  private _isDeleteModeOn: boolean;

  constructor(private router: Router, private dashboardsService: DashboardNavigationService) {}

  /**
   * Subscribe to theme and tooltip changes. Set proper margin of the Dashboard element based on `DashboardType`.
   */
  ngOnInit() {
    this.margin = this.getDashboardElementMargin(this.dashboard.type);
    // this.themeService.theme.subscribe((update) => (this.theme = update));
    this.dashboardsService.onTooltipClose.subscribe(() => {
      this.isTooltipEnabled = false;
      this.isEditModeOn = false;
    });
  }

  /**
   * Validate the title input value.
   */
  public validateTitle() {
    const validationResult = this.dashboardsService.checkTitle(this.input.nativeElement.value);
    this.isTitleValid = validationResult.isValid;
    if (!this.isTitleValid) {
      this.errorMessage = validationResult.errorMessage;
    }
  }

  /**
   * Change the current dashboard using link as URL.
   */
  public changeDashboard() {
    if (!this.isDragModeOn && !this.isDeleteModeOn && !this.isEditModeOn) {
      this.router.navigateByUrl(`/report/${this.dashboard.link}`);
    }
  }

  /**
   * Toggle off all the other tooltips and display a message with options if on.
   * Save current tooltip status before emitting a close trigger.
   */
  public toggleTooltip() {
    this.tooltipMessage = this.isDeleteModeOn ? this.getDeleteTooltip() : "this.dictionary.SaveChangesText";
    this.errorMessage = null;
    this.isTitleValid = true;

    const tooltipStatus = this.isTooltipEnabled;
    this.dashboardsService.closeTooltips();
    this.isTooltipEnabled = !tooltipStatus;

    if (!this.isDeleteModeOn) {
      this.isEditModeOn = !tooltipStatus;
    }
  }

  /**
   * Go to a method based on the current mode.
   */
  public handleButtonClick() {
    this.isDeleteModeOn ? this.deleteDashboard() : this.validateRenaming();
  }

  /**
   * Close the tooltip if user tried to save Edit Mode with the same title.
   */
  public validateRenaming() {
    this.dashboard.title === this.input.nativeElement.value ? this.toggleTooltip() : this.renameDashboard();
  }

  /**
   * Remove the dashboard and send the change to `DashboardService`.
   */
  public deleteDashboard() {
    const changes: DashboardChange = { current: this.dashboard, type: DashboardChangeType.Deleted };

    this.dashboardsService.updateDashboard(changes);
  }

  /**
   * Toggle the favorite status and send the change to `DashboardService`.
   */
  public toggleMain() {
    const changes: DashboardChange = {
      current: this.dashboard,
      type: DashboardChangeType.SelectedMain
    };

    this.dashboardsService.updateDashboard(changes);
  }

  /**
   * Save made changes and send them to `DashboardService`.
   */
  private renameDashboard() {
    const value = this.input.nativeElement.value;
    const validationResult = this.dashboardsService.checkTitle(value);
    const link = value.toLowerCase().replace(/ /g, "-");
    const update = { ...this.dashboard, title: value, link: link };

    validationResult.isValid ? this.sendRequest(update) : this.setErrorState(validationResult.errorMessage);
  }

  /**
   * Send the request to Dashboard Service.
   * @param request Request for Dashboard Service with changes.
   */
  private sendRequest(request: Dashboard) {
    const changes: DashboardChange = {
      previous: this.dashboard,
      current: request,
      type: DashboardChangeType.Renamed
    };
    this.dashboardsService.updateDashboard(changes);
    this.isTooltipEnabled = false;
  }

  /**
   * Show the red error message for the user.
   * @param errorMessage Content of the error message.
   */
  private setErrorState(errorMessage: string) {
    this.isTitleValid = false;
    this.errorMessage = errorMessage;
  }

  /**
   * Return appropriate tooltip for delete action based on it's children array.
   */
  private getDeleteTooltip(): string {
    return this.dashboard.children.length > 0 ? "this.dictionary.DeleteParentText" : "this.dictionary.DeleteDashboardText";
  }

  /**
 * Return appropriate margin for the element based on its type.
 * @param type Corresponds to the Dashboard level in Mat Tree.
 */
  private getDashboardElementMargin(type: DashboardType): number {
    const NO_MARGIN: number = 0;
    const CHILD_MARGIN: number = 20;
    const GRANDCHILD_MARGIN: number = 30;

    switch (type) {
      case DashboardType.Parent: {
        return NO_MARGIN;
      }
      case DashboardType.Child: {
        return CHILD_MARGIN;
      }
      case DashboardType.Grandchild: {
        return GRANDCHILD_MARGIN;
      }
    }
  }
}
