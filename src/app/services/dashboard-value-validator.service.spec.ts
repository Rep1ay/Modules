import { DashboardType } from "../models/dashboard-type";
import { DashboardValueValidatorService } from "./dashboard-value-validator.service";
import { mdLocalizationDictionary } from "@localization/dictionaries/md-localization-dictionary";
import { TestBed } from "@angular/core/testing";
import { configureTestSuite } from 'ng-bullet';

describe("Service: dashboard-value-validator-service", () => {
  let service: DashboardValueValidatorService;
  let dictionary = mdLocalizationDictionary.MdProject;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [DashboardValueValidatorService]
    });
  })

  beforeEach(() => {
    service = TestBed.get(DashboardValueValidatorService);
  });

  describe("checkTitle", () => {
    it("shouldn't allow titles with >20 characters", () => {
      const title = "im a very long title that is not going to pass this test";
      const result = service.checkTitle(title, []);
      expect(result.errorMessage).toBe(dictionary.InputIsTooLong);
      expect(result.isValid).toBeFalse();
    });

    it("shouldn't allow empty titles", () => {
      const title = "";
      const result = service.checkTitle(title, []);
      expect(result.errorMessage).toBe(dictionary.InputIsEmpty);
      expect(result.isValid).toBeFalse();
    });

    it("shouldn't allow duplicates", () => {
      const title = "existing-dashboard";
      const dashboards = [{ title: "existing-dashboard", link: "existing-dashboard", isMain: false, type: DashboardType.Parent }];
      const result = service.checkTitle(title, dashboards);
      expect(result.errorMessage).toBe(dictionary.InputAsTitleAlreadyExists);
      expect(result.isValid).toBeFalse();
    });

    it("shouldn't allow special characters", () => {
      const title = "$#)!@(#)!@#";
      const result = service.checkTitle(title, []);
      expect(result.errorMessage).toBe(dictionary.InputHasInvalidCharacters);
      expect(result.isValid).toBeFalse();
    });

    it("shouldn't allow title with whitespace at the end", () => {
      const title = "    im a title  ";
      const result = service.checkTitle(title, []);
      expect(result.errorMessage).toBe(dictionary.InputStartsOrEndsWithSpace);
      expect(result.isValid).toBeFalse();
    });

    it("should allow correct title", () => {
      const title = "im a good title";
      const result = service.checkTitle(title, []);
      expect(result.isValid).toBeTrue();
    });
  });

  describe("checkLink", () => {
    it("shouldn't allow link with whitespace", () => {
      const link = "im a bad link";
      const result = service.checkLink(link, []);
      expect(result.errorMessage).toBe(dictionary.InputHasWhiteSpace);
      expect(result.isValid).toBeFalse();
    });

    it("shouldn't duplicate links", () => {
      const link = "existing-dashboard";
      const dashboards = [{ title: "existing-dashboard", link: "existing-dashboard", isMain: false, type: DashboardType.Parent }];
      const result = service.checkLink(link, dashboards);
      expect(result.errorMessage).toBe(dictionary.InputAsLinkAlreadyExists);
      expect(result.isValid).toBeFalse();
    });

    it("shouldn't allow links with >20 characters", () => {
      const link = "im-a-very-long-link-that-wont-pass-this-test";
      const result = service.checkLink(link, []);
      expect(result.errorMessage).toBe(dictionary.InputIsTooLong);
      expect(result.isValid).toBeFalse();
    });

    it("shouldn't allow empty links", () => {
      const link = "";
      const result = service.checkLink(link, []);
      expect(result.errorMessage).toBe(dictionary.InputIsEmpty);
      expect(result.isValid).toBeFalse();
    });

    it("shouldn't allow special characters", () => {
      const link = "$#)!@(#)!@#";
      const result = service.checkLink(link, []);
      expect(result.errorMessage).toBe(dictionary.InputHasInvalidCharacters);
      expect(result.isValid).toBeFalse();
    });

    it("should allow correct link", () => {
      const title = "correct-link";
      const result = service.checkLink(title, []);
      expect(result.isValid).toBeTrue();
    });
  });
});
