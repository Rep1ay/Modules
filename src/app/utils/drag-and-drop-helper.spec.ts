import { DashboardNode } from "@sidebar/models/navigation-panel/dashboard";
import { DashboardType } from "@sidebar/models/navigation-panel/dashboard-type";
import { DragPosition } from "./../sidebar/models/navigation-panel/drag-position";
import { isDashboardDropCorrect } from "@utils/drag-and-drop-helper";

describe("Util: drag-and-drop-helper", () => {
  const defaultNode = { link: "", title: "", isMain: false, children: [] };

  it("shouldn't drop parents with grandchildren into a child", () => {
    const grandChild: DashboardNode = { ...defaultNode, type: DashboardType.Grandchild };
    const child: DashboardNode = { ...defaultNode, type: DashboardType.Child, children: [grandChild] };
    const dragged: DashboardNode = { ...defaultNode, type: DashboardType.Parent, children: [child], link: "dashboard" };
    const droppedOn: DashboardNode = { ...defaultNode, type: DashboardType.Child, link: "other-dash" };
    const area = DragPosition.Center;
    const result = isDashboardDropCorrect(droppedOn, dragged, area);

    expect(result).toBeFalse();
  });

  it("shouldn't drop node into itself", () => {
    const dragged: DashboardNode = { ...defaultNode, type: DashboardType.Parent, link: "id" };
    const droppedOn: DashboardNode = { ...defaultNode, type: DashboardType.Parent, link: "id" };
    const area = DragPosition.Center;
    const result = isDashboardDropCorrect(droppedOn, dragged, area);

    expect(result).toBeFalse();
  });

  it("shouldn't drop a parent with grandchildren into another parent", () => {
    const grandChild: DashboardNode = { ...defaultNode, type: DashboardType.Grandchild,  };
    const child: DashboardNode = { ...defaultNode, type: DashboardType.Child, children: [grandChild] };
    const dragged: DashboardNode = { ...defaultNode, type: DashboardType.Parent, children: [child], link: "dashboard" };

    const droppedOn: DashboardNode = { ...defaultNode, type: DashboardType.Parent ,link: "other-dash"};
    const area = DragPosition.Center;
    const result = isDashboardDropCorrect(droppedOn, dragged, area);

    expect(result).toBeFalse();
  });

  it("shouldn't add any child to a grandchild", () => {
    const dragged: DashboardNode = { ...defaultNode, type: DashboardType.Child , link: "dashboard"};
    const droppedOn: DashboardNode = { ...defaultNode, type: DashboardType.Grandchild , link: "other-dash"};
    const area = DragPosition.Center;
    const result = isDashboardDropCorrect(droppedOn, dragged, area);

    expect(result).toBeFalse();
  });

  it("shouldn't add a child with grandchildren into another child", () => {
    const grandChild: DashboardNode = { ...defaultNode, type: DashboardType.Grandchild };
    const dragged: DashboardNode = { ...defaultNode, type: DashboardType.Child, children: [grandChild] , link: "dashboard"};
    const droppedOn: DashboardNode = { ...defaultNode, type: DashboardType.Child , link: "other-dash"};
    const area = DragPosition.Center;
    const result = isDashboardDropCorrect(droppedOn, dragged, area);

    expect(result).toBeFalse();
  });

  it("shouldn't a dashboard with children next to a grandchild", () => {
    const grandChild: DashboardNode = { ...defaultNode, type: DashboardType.Grandchild };
    const dragged: DashboardNode = { ...defaultNode, type: DashboardType.Child, children: [grandChild] , link: "dashboard"};
    const droppedOn: DashboardNode = { ...defaultNode, type: DashboardType.Grandchild, link: "other-dash" };
    const area = DragPosition.Below;
    const result = isDashboardDropCorrect(droppedOn, dragged, area);

    expect(result).toBeFalse();
  });
});
