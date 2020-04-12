import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { DashboardChangeType } from '../../models/dashboard-change-type';
import { DashboardElementComponent } from './dashboard-element.component';
import { DashboardNavigationService } from '../../services/dashboard-navigation.service';
import { DashboardType } from '../../models/dashboard-type';
import { DashboardValueValidatorService } from '../../services/dashboard-value-validator.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTreeModule } from '@angular/material';
import { mdLocalizationDictionary } from '@localization/dictionaries/md-localization-dictionary';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Theme, ThemeService, WebServicesConfiguration } from 'ui-core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from 'projects/md/src/lib/test-helpers/translate-service-stub';

class MockRouter {
    public navigateByUrl(url: string) { };
    url: "/reports/dashboard";
}

describe("Component: dashboard-element", () => {
    let fixture: ComponentFixture<DashboardElementComponent>;
    let component: DashboardElementComponent;
    let service: DashboardNavigationService;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardElementComponent],
            providers: [
                ThemeService,
                DashboardNavigationService,
                DashboardValueValidatorService,
                WebServicesConfiguration,
                ThemeService,
                { provide: Router, useClass: MockRouter },
                { provide: TranslateService, useClass: TranslateServiceStub }
            ],
            imports: [MatTreeModule, TranslateModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule]
        });
    });

    beforeEach(() => {
        service = TestBed.get(DashboardNavigationService)

        fixture = TestBed.createComponent(DashboardElementComponent);
        component = fixture.componentInstance;

        component.dashboard = { isMain: false, link: "link", title: "Dashboard", type: DashboardType.Child, children: [] }

        component.ngOnInit();

        service.dashboards = [];
    })

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

    it("should close its tooltip on a call from service", () => {
        component.isTooltipEnabled = true;

        service.closeTooltips();

        expect(component.isTooltipEnabled).toBeFalse();
    })

    it("should close leave edit mode on a call from service", () => {
        component.isEditModeOn = true;

        service.closeTooltips();

        expect(component.isEditModeOn).toBeFalse();
    })

    it("should close its tooltip after delete mode has been turned on", () => {
        component.isTooltipEnabled = true;

        component.isDeleteModeOn = true;

        expect(component.isTooltipEnabled).toBeFalse();
    })

    
    it("should add no margin for parents", () => {
        component.dashboard.type = DashboardType.Parent;

        component.ngOnInit();

        expect(component.margin).toBe(0);
      });
    
      it("should add child margin for children", () => {
        component.dashboard.type = DashboardType.Child;

        component.ngOnInit();

        expect(component.margin).toBe(20);
      });
    
      it("should add grandchild margin for grandchildren", () => {
        component.dashboard.type = DashboardType.Grandchild;

        component.ngOnInit();

        expect(component.margin).toBe(30);
      });

    it("should validate title", () => {
        component.isEditModeOn = true;

        fixture.detectChanges();

        component.input.nativeElement.value = " wdaw$invalid$24 "

        component.validateTitle()

        expect(component.isTitleValid).toBeFalse();

        component.input.nativeElement.value = "dashboard"

        component.validateTitle()

        expect(component.isTitleValid).toBeTrue();
    })

    it("shouldn't navigate to a selected dashboard in drag mode", () => {
        let router: MockRouter = TestBed.get(Router);
        const spy = spyOn(router, 'navigateByUrl').and.callThrough();
        component.isDragModeOn = true;

        component.changeDashboard();

        expect(spy).not.toHaveBeenCalled();
    })

    it("shouldn't navigate to a selected dashboard in delete mode", () => {
        let router: MockRouter = TestBed.get(Router);
        const spy = spyOn(router, 'navigateByUrl').and.callThrough();
        component.isDeleteModeOn = true;

        component.changeDashboard();

        expect(spy).not.toHaveBeenCalled();
    })

    it("shouldn't navigate to a selected dashboard in edit mode", () => {
        let router: MockRouter = TestBed.get(Router);

        const spy = spyOn(router, 'navigateByUrl').and.callThrough();
        component.isEditModeOn = true;

        component.changeDashboard();

        expect(spy).not.toHaveBeenCalled();
    })

    it("should navigate to different dashboard", () => {
        let router: MockRouter = TestBed.get(Router);
        const spy = spyOn(router, 'navigateByUrl').and.callThrough();

        component.changeDashboard();

        expect(spy).toHaveBeenCalledWith(`/report/${component.dashboard.link}`)
    })

    it("should show long delete message for dashboards with children", () => {
        component.dashboard.children = [{ link: "child", title: "Child Dash", isMain: false, type: DashboardType.Child }];

        component.isDeleteModeOn = true;

        component.toggleTooltip();

        expect(component.tooltipMessage).toBe(mdLocalizationDictionary.MdProject.DeleteParentText)
    })

    it("should show short delete message for dashboards without children", () => {
        component.dashboard.children = [];

        component.isDeleteModeOn = true;

        component.toggleTooltip();

        expect(component.tooltipMessage).toBe(mdLocalizationDictionary.MdProject.DeleteDashboardText)
    })

    it("should show short edit mode message", () => {
        component.dashboard.children = [];

        component.isEditModeOn = true;

        component.toggleTooltip();

        expect(component.tooltipMessage).toBe(mdLocalizationDictionary.MdProject.SaveChangesText)
    })

    it("should call other dashboards to close their tooltips", () => {
        const spy = spyOn(service, 'closeTooltips').and.returnValue()

        component.toggleTooltip();

        expect(spy).toHaveBeenCalled()
    })

    it("should show edit mode tooltip when user toggled it", () => {
        spyOn(service, 'closeTooltips').and.returnValue()

        component.isDeleteModeOn = false;
        component.isTooltipEnabled = false;

        component.toggleTooltip();

        expect(component.isEditModeOn).toBeTrue()
    })

    it("should remove dashboard by clicking save button in tooltip", () => {
        const spy = spyOn(service, 'updateDashboard').and.returnValue();

        component.isDeleteModeOn = true;
        component.isTooltipEnabled = true;

        component.handleButtonClick()

        expect(spy.calls.mostRecent().args[0].type).toBe(DashboardChangeType.Deleted);
        expect(spy.calls.mostRecent().args[0].current.link).toBe(component.dashboard.link);
    })

    it("should remove dashboard by clicking save button in tooltip", () => {
        const spy = spyOn(service, 'updateDashboard').and.returnValue();

        component.isDeleteModeOn = true;
        component.isTooltipEnabled = true;

        component.handleButtonClick()

        expect(spy.calls.mostRecent().args[0].type).toBe(DashboardChangeType.Deleted);
        expect(spy.calls.mostRecent().args[0].current.link).toBe(component.dashboard.link);
    })

    it("should close edit mode tooltip when user typed in the same title", () => {
        const spy = spyOn(service, 'updateDashboard').and.returnValue();

        component.isEditModeOn = true;
        component.isTooltipEnabled = true;
        fixture.detectChanges();
        
        component.input.nativeElement.value = component.dashboard.title;

        component.handleButtonClick()

        expect(spy).not.toHaveBeenCalled();
        expect(component.isTooltipEnabled).toBeFalse();
        expect(component.isEditModeOn).toBeFalse();
    })

    it("should rename dashboard by clicking save button in tooltip", () => {
        const spy = spyOn(service, 'updateDashboard').and.returnValue();

        component.isEditModeOn = true;
        component.isTooltipEnabled = true;

        fixture.detectChanges();
        
        component.input.nativeElement.value = "DIFFERENT TITLE";
        component.handleButtonClick()

        expect(spy.calls.mostRecent().args[0].type).toBe(DashboardChangeType.Renamed);
        expect(spy.calls.mostRecent().args[0].current.title).toBe("DIFFERENT TITLE");
    })

    it("should update link of the dashboard on rename", () => {
        const spy = spyOn(service, 'updateDashboard').and.returnValue();

        component.isEditModeOn = true;
        component.isTooltipEnabled = true;

        fixture.detectChanges();
        
        component.input.nativeElement.value = "DIFFERENT TITLE";
        component.handleButtonClick()

        expect(spy.calls.mostRecent().args[0].type).toBe(DashboardChangeType.Renamed);
        expect(spy.calls.mostRecent().args[0].current.link).toBe("different-title");
    })

    it("should show error message when title is invalid", () => {
        const spy = spyOn(service, 'updateDashboard').and.returnValue();

        component.isEditModeOn = true;
        component.isTooltipEnabled = true;

        fixture.detectChanges();
        
        component.input.nativeElement.value = "$$$$$$$invalid   ";
        component.handleButtonClick()

        expect(spy).not.toHaveBeenCalled();
        expect(component.isTitleValid).toBeFalse();
    })

    it("should change favorite dashboard", () => {
        const spy = spyOn(service, 'updateDashboard').and.returnValue();

        component.dashboard.isMain = false;

        component.toggleMain();

        expect(spy.calls.mostRecent().args[0].type).toBe(DashboardChangeType.SelectedMain);
    })
})