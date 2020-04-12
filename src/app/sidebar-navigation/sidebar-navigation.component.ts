import _ from "lodash";
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { DashboardNode, Dashboard } from '../models/dashboard';
import { DragPosition } from '../models/drag-position';
import { MatTreeFlatDataSource, MatTreeFlattener, MatSidenav } from '@angular/material';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DashboardNavigationService } from '../services/dashboard-navigation.service';
import { NavigationButton } from '../models/navigation-button';
import { isDashboardDropCorrect } from '../utils/drag-and-drop-helper';
import { DashboardType } from '../models/dashboard-type';
import { EntityId } from '../app.component';

@Component({
  selector: "sidebar-navigation",
  templateUrl: "sidebar-navigation.component.html",
  styleUrls: ["./sidebar-navigation.component.scss"],
  animations: [
    trigger("enterAnimation", [
      transition(":enter", [style({ opacity: 0 }), animate("300ms", style({ opacity: 1 }))]),
      transition(":leave", [style({ opacity: 1 }), animate("300ms", style({ opacity: 0 }))])
    ])
  ]
})
export class SidebarNavigationComponent implements OnInit {
  // private _activeReport: { reportId: EntityId };

  // @ViewChild("sidenav", { static: false }) public sidenav: MatSidenav;

  // @Input()
  // set activeReport(activeReport: { reportId: EntityId }) {
  //   this._activeReport = activeReport;
  // }

  // public toggleSidenav() {
  //   this.sidenav.toggle();
  // }

  // get activeReport() {
  //   return this._activeReport;
  // }

  activeReport: { reportId: EntityId};
  @ViewChild("sidenav", { static: false }) public sidenav: MatSidenav;

  public toggleSidenav() {
    this.sidenav.toggle();
  }

  public setActiveReport(report:  { reportId: EntityId}) {
    this.activeReport = report;
  }
  /**
   * Input element that disables the tree functionality on use.
   */
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  /**
   * Whether to roll out `SidebarFormElement`.
   */
  public isFormShown: boolean;
  /**
   * Whether to apply color change and trash icon visibility.
   */
  public isDeleteModeOn: boolean;
  /**
   * Whether to apply color change to the dashboard-elements.
   */
  public isDragModeOn: boolean;
  /**
   * Text displayed after activating `isDeleteModeOn` or `isDragModeOn`.
   */
  public informationText: string;
  /**
   * Whether the data source is loaded. Required check for *ngIf.
   */
  public isDataReady: boolean;
  /**
   * Whether to turn off the `isDragModeOn` and remove tree structure.
   */
  public isSearchModeOn: boolean;
  /**
   * `DashboardNode` currently being dragged.
   */
  public dragNode: DashboardNode;
  /**
   * Expand `DashboardNode` after this time and show its children.
   */
  public dragNodeExpandOverWaitTimeMs: number = 500;
  /**
   * Currently hovered over `DashboardNode`.
   */
  public dragNodeExpandOverNode: DashboardNode;
  /**
   * Current time of a dashboard hover over another node.
   */
  public dragNodeExpandOverTime: number;
  /**
   * Current position of cursor related to `dragNodeExpandOverNode` .
   */
  public dragNodeExpandOverArea: DragPosition;
  /**
   * Dictionary that contains all the translations in the application.
   */
  // public dictionary = mdLocalizationDictionary.MdProject;
  /**
   * Currently set application's theme.
   */
  // public theme: Theme;
  /**
   * Deep clone of the data source used as a reference during search mode.
   */
  private dataSourceClone: DashboardNode[];
  /**
   * Contains nodes that were expanded before a drag & drop, including the dragged one.
   */
  private nodesOpened: DashboardNode[] = [];
  public dataSource: MatTreeFlatDataSource<Dashboard, DashboardNode>;
  public treeFlattener: MatTreeFlattener<Dashboard, DashboardNode>;
  public treeControl: FlatTreeControl<DashboardNode>;

  constructor(private dashboardsService: DashboardNavigationService) {}

  /**
   * Subscribe to theme changes and dashboards updates.
   */
  ngOnInit() {
    // this.themeService.theme.subscribe((value: Theme) => (this.theme = value));
    this.dashboardsService.getDashboards().subscribe((dashboards: Dashboard[]) => this.assignInitialData(dashboards));
    this.dashboardsService.dashboardsChange.subscribe((dashboards: Dashboard[]) => this.updateData(dashboards));
    this.dashboardsService.onFormClosed.subscribe(() => (this.isFormShown = false));
  }

  /**
   * Turn off `isDragModeOn` and disable tree structure. This will remove all unsaved changes of rearrangement.
   */
  public toggleSearchMode() {
    if (this.nodesOpened.length === 0) {
      this.nodesOpened = this.getExpandedNodes();
    }

    this.isDragModeOn = false;

    const searchValue = (this.searchInput.nativeElement as HTMLInputElement).value.toUpperCase();
    this.isSearchModeOn = searchValue.length > 0;

    this.dataSource.data = _.cloneDeepWith(this.dataSourceClone).filter((node) => node.level == 0);

    if (this.isSearchModeOn) {
      this.filterDataStructure(searchValue);
    } else {
      this.expandNodes(this.nodesOpened);
      this.nodesOpened = [];
    }
  }

  /**
   * Whether to apply active CSS style for dashboard currently open.
   */
  public isActive(dashboard: Dashboard): boolean {
    return this.dashboardsService.isDashboardActive(dashboard.link);
  }

  /**
   * Whether the node has a children array. Method used in the template only.
   */
  public hasNestedChild(index: number, dashboard: Dashboard): boolean {
    return dashboard.children.length > 0;
  }

  /**
   * Return CSS class for dashboard element based on current drag position.
   */
  public getDragStyle(dashboard: DashboardNode): string {
    if (this.dragNodeExpandOverArea === DragPosition.Above && this.dragNodeExpandOverNode === dashboard) {
      return "drop-above";
    }
    if (this.dragNodeExpandOverArea === DragPosition.Center && this.dragNodeExpandOverNode === dashboard) {
      return "drop-center";
    }
    if (this.dragNodeExpandOverArea === DragPosition.Below && this.dragNodeExpandOverNode === dashboard) {
      return "drop-below";
    }
  }

  /**
   * Disable other modes and turn on only the clicked one.
   */
  public toggleModes(button: NavigationButton) {
    this.isDeleteModeOn = button == NavigationButton.Delete && !this.isDeleteModeOn;
    this.isDragModeOn = button == NavigationButton.Drag && !this.isDragModeOn && !this.isSearchModeOn;
    this.isFormShown = button == NavigationButton.Add && !this.isFormShown;

    this.informationText = this.getInformationText(button);
    this.dashboardsService.closeTooltips();

    const shouldUpdateAfterDeleteMode = !this.isDeleteModeOn && button == NavigationButton.Delete;
    const shouldUpdateAfterDragMode = !this.isDragModeOn && button == NavigationButton.Drag;

    if (shouldUpdateAfterDragMode || shouldUpdateAfterDeleteMode) {
      this.sendRearrangement();
    }

    if (!this.isFormShown) {
      this.dashboardsService.onFormClosed.next();
    }
  }

  /**
   * Update the dashboards configuration with tree control structure (flat).
   */
  public sendRearrangement() {
    this.dataSourceClone = _.cloneDeepWith(this.treeControl.dataNodes);

    const update = { id: "dashboards", dashboards: this.treeControl.dataNodes };
    this.dashboardsService.updateDashboards(update).subscribe();
  }

  /**
   * Set the current dragged node and collapse it's children.
   * Remove drag container (preview of an element) to make it more usable.
   */
  public handleDragStart(event: DragEvent, node: DashboardNode) {
    event.dataTransfer.setDragImage(document.createElement("div"), 0, 0);

    this.dragNode = node;

    this.nodesOpened = this.getExpandedNodes();

    this.collapseWithChildren(node);
  }

  /**
   * Add item to dashboards/children based on type of the drop.
   * Remove previous instance of the dragged node.
   */
  public handleDrop(event: DragEvent, droppedOn: DashboardNode) {
    event.preventDefault();
    const isDragCorrect = isDashboardDropCorrect(droppedOn, this.dragNode, this.dragNodeExpandOverArea);

    if (!isDragCorrect) {
      this.handleDragEnd();
      return;
    }

    const originalDashboard = this.findDraggedNode(this.dragNode);
    const nodeCopy = _.cloneDeepWith(originalDashboard);
    originalDashboard.hasBeenMoved = true;

    this.moveDashboard(nodeCopy, droppedOn);

    this.dataSource.data = this.removeMovedNodes(this.dataSource.data);

    this.expandNodes(this.nodesOpened);

    this.treeControl.expand(this.findNode(droppedOn.link));

    this.handleDragEnd();
  }

  /**
   * Reset all the values related to drag and drop.
   */
  public handleDragEnd() {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.nodesOpened = [];
  }

  /**
   * Set the current drag position type and open parent after `dragNodeExpandOverWaitTimeMs`.
   */
  public handleDragOver(event, node: DashboardNode) {
    event.preventDefault();

    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode != node && !this.treeControl.isExpanded(node)) {
        if (new Date().getTime() - this.dragNodeExpandOverTime > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = DragPosition.Above;
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = DragPosition.Below;
    } else {
      this.dragNodeExpandOverArea = DragPosition.Center;
    }
  }

  /**
   * Find a dashboard that has been dragged by the user in the data source.
   */
  private findDraggedNode(dashboard: Dashboard): Dashboard {
    switch (dashboard.type) {
      case DashboardType.Parent: {
        return this.dataSource.data.find((node) => node.link == dashboard.link);
      }
      case DashboardType.Child: {
        const parent = this.dataSource.data.find((node) => node.link == dashboard.parent);
        return parent.children.find((node) => node.link == dashboard.link);
      }
      case DashboardType.Grandchild: {
        const grandParent = this.dataSource.data.find((parent) => parent.children.some((child) => child.link === dashboard.parent));
        const parent = grandParent.children.find((parent) => parent.link == dashboard.parent);
        return parent.children.find((node) => node.link == dashboard.link);
      }
    }
  }

  /**
   * Remove node that has been moved and it's children.
   */
  private removeMovedNodes(dashboards: Dashboard[]): Dashboard[] {
    return dashboards.filter((node) => {
      if (node.hasBeenMoved && node.children.length > 0) {
        node.children.forEach((child) => (child.hasBeenMoved = true));
      }

      node.children = this.removeMovedNodes(node.children);

      return !node.hasBeenMoved;
    });
  }

  /**
   * Move the dashboard position based on the drag type.
   */
  private moveDashboard(draggedNode: DashboardNode, droppedOn: DashboardNode) {
    switch (this.dragNodeExpandOverArea) {
      case DragPosition.Above: {
        this.moveDashboardNextToSibling(draggedNode, droppedOn, true);
        break;
      }
      case DragPosition.Below: {
        this.moveDashboardNextToSibling(draggedNode, droppedOn, false);
        break;
      }
      case DragPosition.Center: {
        this.moveDashboardIntoParent(draggedNode, droppedOn);
        break;
      }
    }
  }

  /**
   * Return child type based on the parent's type.
   */
  private getChildType(parent: DashboardNode): DashboardType {
    return parent === undefined
      ? DashboardType.Parent
      : parent.type == DashboardType.Parent
      ? DashboardType.Child
      : DashboardType.Grandchild;
  }

  /**
   * Moves the dashboard into the parent's children array. Moves all children with it.
   * Update children into grandchildren.
   */
  private moveDashboardIntoParent(movedNode: DashboardNode, parent: DashboardNode) {
    this.insertChildIntoParent(parent, movedNode);

    if (movedNode.children.length > 0) {
      movedNode.children.forEach((child: DashboardNode) => this.updateChild(child, movedNode));
    }
  }

  /**
   * Add item to the parent children's list.
   */
  private insertChildIntoParent(parent: DashboardNode, child: DashboardNode) {
    child.type = this.getChildType(parent);
    child.parent = parent.link;
    parent.children.push(child);
  }

  /**
   * Drag and drop happened Above or Below. Update dashboard's children as well.
   * Add item below or above in array (data source or another dashboard's children array).
   */
  private moveDashboardNextToSibling(node: DashboardNode, sibling: DashboardNode, insertAbove?: boolean) {
    this.insertNextToSibling(sibling, node, insertAbove);

    if (node.children.length > 0) {
      node.children.forEach((child: DashboardNode) => this.updateChild(child, node));
    }
  }

  /**
   * Add item to parent's children list or directly to data source (as a parent).
   */
  private insertNextToSibling(sibling: DashboardNode, draggedNode: DashboardNode, insertAbove: boolean) {
    const MOVE_BY = insertAbove ? 0 : 1;
    const parentNode = this.findNode(sibling.parent);

    draggedNode.type = this.getChildType(parentNode);
    draggedNode.parent = sibling.parent;

    const shouldMoveIntoDataSource = parentNode === undefined;

    if (shouldMoveIntoDataSource) {
      const index = this.dataSource.data.findIndex((dashboard: DashboardNode) => dashboard.link == sibling.link);
      this.dataSource.data.splice(index + MOVE_BY, 0, draggedNode);
      _.unset(draggedNode, "parent");
    } else {
      const siblingIndex = parentNode.children.findIndex((parentChild: DashboardNode) => parentChild.link == sibling.link);
      parentNode.children.splice(siblingIndex + MOVE_BY, 0, draggedNode);
    }
  }

  /**
   * Update child type, parent (link) and it's children.
   */
  private updateChild(child: DashboardNode, parent: DashboardNode) {
    child.type = this.getChildType(parent);
    child.parent = parent.link;

    if (child.children.length > 0) {
      child.children.forEach((grandchild: DashboardNode) => this.updateChild(grandchild, child));
    }
  }

  /**
   * Set up the TreeStructure and clone data source.
   * ### NOTE All the methods passed in arguments are going to use MatTreeFlattener scope, not component one.
   */
  private assignInitialData(dashboards: Dashboard[]) {
    this.treeFlattener = new MatTreeFlattener(this.getTransformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.dataSource.data = this.mapDashboardsArrays(dashboards);
    this.dataSourceClone = _.cloneDeepWith(this.treeControl.dataNodes);
    this.isDataReady = true;
  }

  /**
   * Update the data while keeping the already expanded nodes. Refilter the data while in search mode.
   */
  private updateData(dashboards: Dashboard[]) {
    const expandedItems = this.getExpandedNodes();

    this.dataSource.data = this.mapDashboardsArrays(dashboards);
    this.dataSourceClone = _.cloneDeepWith(this.treeControl.dataNodes);

    const isSearchModeOn = (this.searchInput.nativeElement as HTMLInputElement).value.length > 0;
    if (isSearchModeOn) {
      this.toggleSearchMode();
    }

    this.expandNodes(expandedItems);
  }

  /**
   * Collapses node and all of its children.
   */
  private collapseWithChildren(node: DashboardNode) {
    this.treeControl.collapse(node);
    if (node.children.length > 0) {
      node.children.forEach((child: DashboardNode) => this.collapseWithChildren(child));
    }
  }

  /**
   * Returns which nodes has been expanded prior any update.
   */
  private getExpandedNodes(): DashboardNode[] {
    return this.treeControl.dataNodes
      .reduce((nodes: DashboardNode[], node: DashboardNode) => {
        return this.treeControl.isExpanded(node) ? [...nodes, node] : nodes;
      }, [])
      .sort((a, b) => a.level - b.level);
  }

  /**
   * Expand nodes which were previously expanded (before any update).
   */
  private expandNodes(nodes: DashboardNode[]) {
    nodes.forEach((node) => {
      const dataTreeNode = this.findNode(node.link);
      this.treeControl.expand(dataTreeNode);
    });
  }

  /**
   * Array from back-end comes back as flat. Rebuild it into tree structure.
   */
  private mapDashboardsArrays(dashboards: Dashboard[]): Dashboard[] {
    return dashboards
      .sort((a, b) => this.getLevel(a) - this.getLevel(b))
      .reduce((array: Dashboard[], dashboard: Dashboard) => this.rebuildTreeStructure(array, dashboard), []);
  }

  /**
   * Recreate the structure of dashboards from flat array.
   * MatTree methods require a node to have quick access to children through node.
   */
  private rebuildTreeStructure(dashboards: Dashboard[], dashboard: Dashboard): Dashboard[] {
    dashboard.children = [];

    switch (dashboard.type) {
      case DashboardType.Parent: {
        dashboards.push(dashboard);
        break;
      }
      case DashboardType.Child: {
        const parent = dashboards.find((parentDashboard) => parentDashboard.link === dashboard.parent);
        parent.children.push(dashboard);
        break;
      }
      case DashboardType.Grandchild: {
        const grandParent = dashboards.find((parent) => parent.children.some((child) => child.link === dashboard.parent));
        const parent = grandParent.children.find((parent) => parent.link == dashboard.parent);
        parent.children.push(dashboard);
        break;
      }
    }

    return dashboards;
  }

  /**
   * Return instructions for the user for a given mode.
   */
  private getInformationText(button: NavigationButton): string {
    return button == NavigationButton.Delete ? "this.dictionary.DeleteModeText" : "this.dictionary.DragModeText";
  }

  /**
   * Filter the data source and disable tree structure.
   */
  private filterDataStructure(searchValue: string) {
    this.dataSource.data = _.cloneDeepWith(this.dataSourceClone)
      .map((dashboard) => this.disableNodeTreeStructure(dashboard))
      .filter((dashboard) => dashboard.title.toUpperCase().includes(searchValue));
  }

  /**
   * Clear children array, set type to parent.
   */
  private disableNodeTreeStructure(dashboard: Dashboard): DashboardNode {
    return { ...dashboard, type: DashboardType.Parent, level: 0, children: [] };
  }

  /**
   * Find node in the tree control array.
   */
  private findNode(link: string): DashboardNode {
    return this.treeControl.dataNodes.find((node: DashboardNode) => node.link == link);
  }

  /**
   * Changes the `Dashboard` element into `DashboardNode` by adding a level property (node depth).
   */
  private getTransformer(dashboard: Dashboard, level: number): DashboardNode {
    return { ...dashboard, level };
  }

  /**
   * Get level of the Dashboard based on its type.
   */
  private getLevel(dashboard: DashboardNode): number {
    return dashboard.type != DashboardType.Parent ? (dashboard.type != DashboardType.Child ? 2 : 1) : 0;
  }

  /**
   * Get children of the `DashboardNode`.
   */
  private getChildren(dashboard: DashboardNode): Dashboard[] {
    return dashboard.children;
  }

  /**
   * Returns true if dashboard type is not a Grandchild.
   */
  private isExpandable(dashboard: DashboardNode): boolean {
    return dashboard.type != DashboardType.Grandchild;
  }
}
