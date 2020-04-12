import { DashboardType } from "./dashboard-type";

/**
 * Representation of the report saved in the dashboards.json
 */
export interface Dashboard {
  /**
   * URL of the report, which also acts as an id.
   */
  link: string;
  /**
   * Pretty name of the report visible in the Navigation Panel.
   */
  title: string;
  /**
   * Whether this dashboard should be opened on after moving to an empty url.
   */
  isMain: boolean;
  /**
   * Type of the dashboard, which corresponds to its level inside of Mat Tree.
   */
  type: DashboardType;
  /**
   * An array of lower level dashboards. Only possible if this dashboard is a type of Parent or Child.
   */
  children?: DashboardNode[];
  /**
   * Link of the parent dashboard. Dashboard of type Parent cannot have a parent.
   */
  parent?: string;
  /**
   * Whether the dashboard was dragged by the user.
   */
  hasBeenMoved?: boolean;
}

/**
 * Extension of the `Dashboard` interface required for MatTree to work correctly.
 * This value isn't saved in the dashboards.json
 */
export interface DashboardNode extends Dashboard {
  /**
   * Level of the dashboard in Mat Tree based on its `DashboardType`.
   */
  level?: number;
}
