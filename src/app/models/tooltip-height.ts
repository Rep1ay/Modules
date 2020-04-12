/**
 * Possible sizes of the tooltip for Dashboard Element Component.
 * Height depends on type of action user invoked in Navigation Panel.
 */
export enum TooltipHeight {
  /**
   * User started Edit Mode.
   */
  Small,
  /**
   * User wants to delete a dashboard without any children.
   */
  Normal,
  /**
   * User wants to delete a dashboard with children.
   */
  Big
}
