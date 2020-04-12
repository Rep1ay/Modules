/**
 * Current position of the dragged Dashboard Navigation Element compared to element beneath.
 */
export enum DragPosition {
  /**
   * Dashboard is being held above 75% height of the other dashboard.
   */
  Above = "Above",
  /**
   * Dashboard is being held between 25% to 75% height of the other dashboard.
   */
  Center = "Center",
  /**
   * Dashboard is being held below the 25% height of the other component.
   */
  Below = "Below"
}
