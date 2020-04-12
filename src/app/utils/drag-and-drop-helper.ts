import { DashboardNode } from "../models/dashboard";
import { DragPosition } from "../models/drag-position";
import { DashboardType } from "../models/dashboard-type";

/**
 * Check if the drag and drop from Mat Tree is correct.
 * @param area Where the the user dropped the node.
 */
export function isDashboardDropCorrect(droppedOn: DashboardNode, dragged: DashboardNode, area: DragPosition) {
  let isCorrect = true;
  // You can't drop parents with grandchildren next/into a child.
  if (droppedOn.type === DashboardType.Child && dragged.children.length > 0) {
    isCorrect = dragged.children.every((child) => child.children.length === 0);
  }
  // You can't drop a parent with grandchildren into a parent.
  if (droppedOn.type === DashboardType.Parent && dragged.children.length > 0 && area === DragPosition.Center) {
    isCorrect = isCorrect && dragged.children.every((child) => child.children.length === 0);
  }
  if (droppedOn.link === dragged.link) {
    return false;
  }
  // You can't add a child a to grandchild.
  if (droppedOn.type === DashboardType.Grandchild && area === DragPosition.Center) {
    return false;
  }
  // You can't drop a child with grandchildren into a child.
  if (droppedOn.type === DashboardType.Child && dragged.children.length > 0 && area === DragPosition.Center) {
    return false;
  }
  // You can't drop a parent/child with children/grandchildren next to a grandchild.
  if (droppedOn.type === DashboardType.Grandchild && dragged.children.length > 0) {
    return false;
  }

  return isCorrect;
}
