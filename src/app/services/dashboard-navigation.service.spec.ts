import { Dashboard } from "../models/dashboard";
import { DashboardChange } from "../models/dashboard-change";
import { DashboardChangeType } from "../models/dashboard-change-type";
import { DashboardNavigationService } from "./dashboard-navigation.service";
import { DashboardType } from "../models/dashboard-type";
import { DashboardValueValidatorService } from "./dashboard-value-validator.service";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { mdLocalizationDictionary } from "@localization/dictionaries/md-localization-dictionary";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed } from "@angular/core/testing";
import { WebServicesConfiguration } from "ui-core";
import { configureTestSuite } from 'ng-bullet';

describe("Service: dashboard-navigation-service", () => {
  let service: DashboardNavigationService;
  let httpTestingController: HttpTestingController;
  let webServicesConfiguration: WebServicesConfiguration;
  let validatorService: DashboardValueValidatorService;
  let router: Router;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [DashboardNavigationService, WebServicesConfiguration, DashboardValueValidatorService],
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
  })

  beforeEach(() => {
    router = TestBed.get(Router);

    httpTestingController = TestBed.get(HttpTestingController);

    webServicesConfiguration = TestBed.get(WebServicesConfiguration);
    webServicesConfiguration.reportsUrl = "report-url";

    validatorService = TestBed.get(DashboardValueValidatorService);
    service = TestBed.get(DashboardNavigationService);
  });

  describe("getDashboards", () => {
    it("should send a request for dashboards", () => {
      const dashboards: Dashboard[] = [{ link: "link", title: "title", isMain: true, type: DashboardType.Parent }];
      service.getDashboards().subscribe((response) => {
        expect(response).toBe(dashboards);
      });

      const req = httpTestingController.expectOne(`${webServicesConfiguration.reportsUrl}/dashboards`);

      expect(req.request.method).toBe("GET");

      req.flush({ dashboards });
    });
  });

  describe("addReport", () => {
    it("should send a request to add new report", () => {
      service.addReport({}).subscribe();

      const req = httpTestingController.expectOne(`${webServicesConfiguration.reportsUrl}/empty`);

      expect(req.request.method).toBe("PUT");

      req.flush({});
    });
  });
  describe("renameReport", () => {
    it("should send a request to rename report", () => {
      const oldLink = "old-link";
      const newLink = "new-link";
      service.renameReport(oldLink, newLink).subscribe();

      const req = httpTestingController.expectOne(`${webServicesConfiguration.reportsUrl}/${oldLink}`);

      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual({ link: newLink });

      req.flush({});
    });
  });

  describe("deleteReport", () => {
    it("should send a request to delete report", () => {
      const link = "delete-link";
      service.deleteReport(link).subscribe();

      const req = httpTestingController.expectOne(`${webServicesConfiguration.reportsUrl}/${link}`);

      expect(req.request.method).toBe("DELETE");

      req.flush({});
    });
  });

  describe("updateDashboards", () => {
    it("should send a request to update dashboards", () => {
      const dashboards: Dashboard[] = [{ link: "link", title: "title", isMain: true, type: DashboardType.Parent }];
      const report = { dashboards, id: "dashboards" };
      service.updateDashboards(report).subscribe();

      const req = httpTestingController.expectOne(`${webServicesConfiguration.reportsUrl}/dashboards`);

      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toBe(report);

      req.flush({});
    });

    it("should remove children before updating dashboards", () => {
      const exampleDashboard = { link: "link", title: "title", isMain: true, type: DashboardType.Parent };
      const dashboards: Dashboard[] = [{ children: [{ ...exampleDashboard, type: DashboardType.Child }], ...exampleDashboard }];

      const reportWithChildren = { dashboards, id: "dashboards" };
      const reportWithoutChildren = { dashboards: [{ ...exampleDashboard, parent: undefined }], id: "dashboards" };

      service.updateDashboards(reportWithChildren).subscribe();

      const req = httpTestingController.expectOne(`${webServicesConfiguration.reportsUrl}/dashboards`);

      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual(reportWithoutChildren);

      req.flush({});
    });
  });

  describe("closeTooltips", () => {
    it("should emit an event to close tooltips", () => {
      spyOn(service.onTooltipClose, "next");

      service.closeTooltips();

      expect(service.onTooltipClose.next).toHaveBeenCalled();
    });
  });

  describe("checkTitle", () => {
    it("should validate the title", () => {
      const dashboards: Dashboard[] = [{ link: "link", title: "title", isMain: true, type: DashboardType.Parent }];
      service.dashboards = dashboards;

      const title = "dashboard title";
      const result = service.checkTitle(title);

      expect(result.isValid).toBeTrue();
    });
  });

  describe("checkLink", () => {
    it("should validate the link", () => {
      const dashboards: Dashboard[] = [{ link: "link", title: "title", isMain: true, type: DashboardType.Parent }];
      service.dashboards = dashboards;

      const link = "dashboard-link";
      const result = service.checkLink(link);

      expect(result.isValid).toBeTrue();
    });
  });

  describe("updateDashboard", () => {
    it("should rename the title", () => {
      const dashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      service.dashboards = [dashboard];

      const newTitle = "My New Dashboard";
      const renamedDashboard = { ...dashboard, title: newTitle };
      const renamedChange: DashboardChange = {
        previous: dashboard,
        current: renamedDashboard,
        type: DashboardChangeType.Renamed
      };

      service.updateDashboard(renamedChange);
      expect(service.dashboards[0].title).toBe(newTitle);
    });

    it("should change the link on title rename", () => {
      const dashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      service.dashboards = [dashboard];

      const newTitle = "My New Dashboard";
      const newLink = "my-new-dashboard";
      const renamedDashboard = { isMain: true, type: DashboardType.Parent, title: newTitle, link: newLink };
      const renamedChange: DashboardChange = {
        previous: dashboard,
        current: renamedDashboard,
        type: DashboardChangeType.Renamed
      };

      service.updateDashboard(renamedChange);
      expect(service.dashboards[0].link).toBe(newLink);
    });

    it("should change children's parent reference on rename", () => {
      const child = { link: "dash-child", title: "Dash Child", isMain: false, type: DashboardType.Child, parent: "my-dashboard" };
      const dashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      service.dashboards = [dashboard, child];

      const newTitle = "My New Dashboard";
      const newLink = "my-new-dashboard";
      const renamedDashboard = { isMain: true, type: DashboardType.Parent, title: newTitle, link: newLink };
      const renamedChange: DashboardChange = {
        previous: dashboard,
        current: renamedDashboard,
        type: DashboardChangeType.Renamed
      };

      service.updateDashboard(renamedChange);

      const childAfterUpdate = service.dashboards.find((dashboard) => dashboard.type == DashboardType.Child);
      expect(childAfterUpdate.parent).toBe(newLink);
    });

    it("shouldn't change other children's parent reference on rename", () => {
      const child = { link: "dash-child", title: "Dash Child", isMain: false, type: DashboardType.Child, parent: "my-other-dash" };
      const dashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      service.dashboards = [dashboard, child];

      const newTitle = "My New Dashboard";
      const newLink = "my-new-dashboard";
      const renamedDashboard = { ...dashboard, title: newTitle, link: newLink };
      const renamedChange: DashboardChange = {
        previous: dashboard,
        current: renamedDashboard,
        type: DashboardChangeType.Renamed
      };

      service.updateDashboard(renamedChange);

      const childAfterUpdate = service.dashboards.find((dashboard) => dashboard.type == DashboardType.Child);
      expect(childAfterUpdate.parent).toBe("my-other-dash");
    });

    it("should change the favorite", () => {
      const firstDashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      const secondDashboard = { link: "my-other-dash", title: "Other Dash", isMain: false, type: DashboardType.Parent };
      service.dashboards = [firstDashboard, secondDashboard];

      const change: DashboardChange = {
        current: secondDashboard,
        type: DashboardChangeType.SelectedMain
      };

      service.updateDashboard(change);
      const changedDashboard = service.dashboards.find((dashboard) => dashboard.title == secondDashboard.title);
      expect(changedDashboard.isMain).toBeTrue();
    });

    it("should deselect previous favorite", () => {
      const firstDashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      const secondDashboard = { link: "my-other-dash", title: "Other Dash", isMain: false, type: DashboardType.Parent };
      service.dashboards = [firstDashboard, secondDashboard];

      const change: DashboardChange = {
        current: secondDashboard,
        type: DashboardChangeType.SelectedMain
      };

      service.updateDashboard(change);
      const previousFavoriteDashboard = service.dashboards.find((dashboard) => dashboard.title == firstDashboard.title);
      expect(previousFavoriteDashboard.isMain).toBeFalse();
    });

    it("should add new dashboard", () => {
      const firstDashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      const secondDashboard = { link: "my-other-dash", title: "Other Dash", isMain: false, type: DashboardType.Parent };
      service.dashboards = [firstDashboard];

      const change: DashboardChange = {
        current: secondDashboard,
        type: DashboardChangeType.Added
      };

      service.updateDashboard(change);
      const isNewDashboardAdded = service.dashboards.some((dashboard) => dashboard.link == secondDashboard.link);
      expect(isNewDashboardAdded).toBeTrue();
    });

    it("should unselect previous favorite after adding new one", () => {
      const firstDashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      const secondDashboard = { link: "my-other-dash", title: "Other Dash", isMain: true, type: DashboardType.Parent };
      service.dashboards = [firstDashboard];

      const change: DashboardChange = {
        current: secondDashboard,
        type: DashboardChangeType.Added
      };

      service.updateDashboard(change);
      const previousFavorite = service.dashboards.find((dashboard) => dashboard.link == firstDashboard.link);
      expect(previousFavorite.isMain).toBeFalse();
    });

    it("should remove dashboard", () => {
      const firstDashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      const secondDashboard = { link: "my-other-dash", title: "Other Dash", isMain: false, type: DashboardType.Parent };
      service.dashboards = [firstDashboard, secondDashboard];

      const change: DashboardChange = {
        current: secondDashboard,
        type: DashboardChangeType.Deleted
      };

      service.updateDashboard(change);

      expect(service.dashboards.length).toBe(1);
    });

    it("should set new favorite after removing previous one", () => {
      const firstDashboard = { link: "my-dashboard", title: "My Dashboard", isMain: false, type: DashboardType.Parent };
      const secondDashboard = { link: "my-other-dash", title: "Other Dash", isMain: true, type: DashboardType.Parent };
      service.dashboards = [firstDashboard, secondDashboard];

      const change: DashboardChange = {
        current: secondDashboard,
        type: DashboardChangeType.Deleted
      };

      service.updateDashboard(change);

      const newFavorite = service.dashboards.find((dashboard) => dashboard.link == firstDashboard.link);
      expect(newFavorite.isMain).toBeTrue();
    });

    it("should remove dashboard's children", () => {
      const child = { link: "dash-child", title: "Dash Child", isMain: false, type: DashboardType.Child, parent: "my-dashboard" };
      const firstDashboard = { link: "my-dashboard", title: "My Dashboard", isMain: false, type: DashboardType.Parent };
      const secondDashboard = { link: "my-other-dash", title: "Other Dash", isMain: true, type: DashboardType.Parent };
      service.dashboards = [firstDashboard, secondDashboard, child];

      const change: DashboardChange = {
        current: firstDashboard,
        type: DashboardChangeType.Deleted
      };

      service.updateDashboard(change);

      expect(service.dashboards.length).toBe(1);
    });

    it("should change current url after removing active dashboard", () => {
      const firstDashboard = { link: "my-dashboard", title: "My Dashboard", isMain: true, type: DashboardType.Parent };
      const secondDashboard = { link: "my-other-dash", title: "Other Dash", isMain: false, type: DashboardType.Parent };
      service.dashboards = [firstDashboard, secondDashboard];
      spyOnProperty(router, "url", "get").and.returnValue("/report/my-dashboard");
      const navigateSpy = spyOn(router, "navigateByUrl");

      const change: DashboardChange = {
        current: firstDashboard,
        type: DashboardChangeType.Deleted
      };

      service.updateDashboard(change);

      expect(navigateSpy).toHaveBeenCalledWith("/report/my-other-dash");
    });
  });

  describe("isDashboardActive", () => {
    it("should return true for active dashboard", () => {
      const link = "my-dashboard";
      spyOnProperty(router, "url", "get").and.returnValue("/report/my-dashboard");

      const result = service.isDashboardActive(link);

      expect(result).toBeTrue();
    });
  });
});
