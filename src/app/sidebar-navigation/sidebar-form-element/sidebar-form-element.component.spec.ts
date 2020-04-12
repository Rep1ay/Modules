import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { DashboardChange } from '../../models/dashboard-change';
import { DashboardChangeType } from '../../models/dashboard-change-type';
import { DashboardNavigationService } from '../../services/dashboard-navigation.service';
import { DashboardValueValidatorService } from '../../services/dashboard-value-validator.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTreeModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { SidebarFormElementComponent } from './sidebar-form-element.component';
import { Theme, ThemeService, WebServicesConfiguration } from 'ui-core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from 'projects/md/src/lib/test-helpers/translate-service-stub';

describe("Component: sidebar-form-element", () => {
  let fixture: ComponentFixture<SidebarFormElementComponent>;
  let component: SidebarFormElementComponent;
  let service: DashboardNavigationService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarFormElementComponent],
      providers: [
        ThemeService,
        DashboardNavigationService,
        DashboardValueValidatorService,
        WebServicesConfiguration,
        ThemeService,
        { provide: TranslateService, useClass: TranslateServiceStub }
      ],
      imports: [MatTreeModule, TranslateModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule]
    });
  });

  beforeEach(() => {
    service = TestBed.get(DashboardNavigationService)
    fixture = TestBed.createComponent(SidebarFormElementComponent);
    component = fixture.componentInstance;

    component.ngOnInit();

    service.dashboards = []
  });

  it("should instantiate", () => {
    expect(component).toBeDefined();
  })

  it("should react to theme change", () => {
    let themeService: ThemeService = TestBed.get(ThemeService);

    expect(component.theme).toBe(Theme.Light)

    themeService.toggleTheme();

    fixture.detectChanges();

    expect(component.theme).toBe(Theme.Dark)
  })

  it("should reset to defaults on trigger from service", () => {
    component.titleInput.nativeElement.value = "title";
    component.linkInput.nativeElement.value = "link";
    component.isCheckboxChecked = true;

    service.onFormClosed.next();

    expect(component.titleInput.nativeElement.value).toBeFalsy();
    expect(component.linkInput.nativeElement.value).toBeFalsy();
    expect(component.isCheckboxChecked).toBeFalse();
  })

  it("should reset to defaults from closeForm", () => {
    component.titleInput.nativeElement.value = "title";
    component.linkInput.nativeElement.value = "link";
    component.isCheckboxChecked = true;

    component.closeForm();

    expect(component.titleInput.nativeElement.value).toBeFalsy();
    expect(component.linkInput.nativeElement.value).toBeFalsy();
    expect(component.isCheckboxChecked).toBeFalse();
  })

  it("should generate link value", () => {
    const title = "This is dashboard";

    component.changeLink(title);

    expect(component.linkInput.nativeElement.value).toBe("this-is-dashboard")
  })

  it("should validate title input", () => {
    const titleInput = component.titleInput.nativeElement as HTMLInputElement
    titleInput.value = " invalid $@@#@# dashboard ---- ";

    component.checkValues()

    expect(component.isTitleCorrect).toBeFalse();
  })

  it("should validate link input", () => {
    const linkInput = component.linkInput.nativeElement as HTMLInputElement
    linkInput.value = " invalid $@@#@# dashboard ---- ";

    component.checkValues()

    expect(component.isLinkCorrect).toBeFalse();
  })

  it("should add new dashboard if not valid", () => {
    const linkInput = component.linkInput.nativeElement as HTMLInputElement
    linkInput.value = " invalid $@@#@# dashboard ---- ";

    component.addDashboard();

    const serviceSpy = spyOn(service, 'updateDashboard').and.returnValue()

    expect(serviceSpy).not.toHaveBeenCalled()
  })

  it("should add new dashboard if valid", () => {
    const linkInput = component.linkInput.nativeElement as HTMLInputElement
    linkInput.value = "parent-dash";
    const titleInput = component.titleInput.nativeElement as HTMLInputElement
    titleInput.value = "Parent Dash";

    let sentChanges: DashboardChange;
    spyOn(service, 'updateDashboard').and.callFake((changes) => sentChanges = changes);

    component.addDashboard();


    expect(sentChanges.type).toBe(DashboardChangeType.Added)
    expect(sentChanges.current.link).toBe("parent-dash")
    expect(sentChanges.current.title).toBe("Parent Dash")
    expect(sentChanges.current.isMain).toBeFalse();
  })

  it("should add new main dashboard if valid", () => {
    const linkInput = component.linkInput.nativeElement as HTMLInputElement
    linkInput.value = "parent-dash";
    const titleInput = component.titleInput.nativeElement as HTMLInputElement
    titleInput.value = "Parent Dash";
    component.isCheckboxChecked = true;

    let sentChanges: DashboardChange;
    spyOn(service, 'updateDashboard').and.callFake((changes) => sentChanges = changes);

    component.addDashboard();

    expect(sentChanges.type).toBe(DashboardChangeType.Added)
    expect(sentChanges.current.link).toBe("parent-dash")
    expect(sentChanges.current.title).toBe("Parent Dash")
    expect(sentChanges.current.isMain).toBeTrue();
  })

  it("should close form after adding new dashboard", () => {
    jasmine.clock().install();
    const linkInput = component.linkInput.nativeElement as HTMLInputElement
    linkInput.value = "parent-dash";
    const titleInput = component.titleInput.nativeElement as HTMLInputElement
    titleInput.value = "Parent Dash";

    let sentChanges: DashboardChange;
    spyOn(service, 'updateDashboard').and.callFake((changes) => sentChanges = changes);

    component.addDashboard();

    jasmine.clock().tick(2000);

    expect(sentChanges).toBeDefined();
    expect(component.isFormShown).toBeFalse()
    jasmine.clock().uninstall()
  })
});
