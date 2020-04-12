/**
 * All possible changes that can happen in Navigation Panel.
 */
export enum DashboardChangeType {
  /**
   * Dashboard has marked as a favorite one. It will act as a main page of the application. Change the `isMain` property.
   */
  SelectedMain,
  /**
   * Title has been changed. Update the value in .json file.
   */
  Renamed,
  /**
   * User has created a new dashboard in Sidebar Form Component.
   */
  Added,
  /**
   * User has removed a report from the Navigation Panel. //
   */
  Deleted,
  /**
   * User has change the structure of Mat Tree.
   */
  Rearranged
}
