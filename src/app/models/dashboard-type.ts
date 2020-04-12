/**
 * Corresponds to the Dashboard level in Mat Tree.
 */
export enum DashboardType {
  /**
   * Dashboard is at the top level and also can have children with grandchildren.
   */
  Parent = "Parent",
  /**
   * Dashboard is in inside another one and can have a child (grandchild).
   */
  Child = "Child",
  /**
   * Dashboard is at the lowest level and cannot have children.
   */
  Grandchild = "Grandchild"
}
