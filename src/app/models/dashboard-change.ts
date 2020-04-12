import { DashboardChangeType } from "./dashboard-change-type";
import { Dashboard } from "./dashboard";

/**
 * Contains current change with a copy of previous value and a new one.
 */
export interface DashboardChange {
  /**
   * Dashboard before any changes.
   */
  previous?: Dashboard;
  /**
   * Dashboard after changes.
   */
  current: Dashboard;
  /**
   * Type of change that user invoked.
   */
  type: DashboardChangeType;
}
