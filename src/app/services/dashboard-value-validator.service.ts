import { Dashboard } from '../models/dashboard';
import { Injectable } from '@angular/core';
// import { mdLocalizationDictionary } from '@localization/dictionaries/md-localization-dictionary';
// import { MdProjectLocalizationDictionary } from '@localization/dictionaries/md-project-localization-dictionary';
import { ValidationResult } from '../models/validation-result';

@Injectable()
export class DashboardValueValidatorService {
  /**
   * Maximum number of letters for titles of dashboards.
   */
  private readonly LETTERS_MAX_LIMIT: number = 20;
  /**
   * Minimum number of letters for titles of dashboards.
   */
  private readonly LETTERS_MIN_LIMIT: number = 0;
  /**
   * Dictionary that contains all the translations in the application.
   */
  // private readonly dictionary: MdProjectLocalizationDictionary = mdLocalizationDictionary.MdProject;

  /**
   * Validate title of a dashboard.
   * Check for duplicated in dashboards array.
   * @param title Title of the dashboard written by the user.
   * @param dashboards Array of already existing dashboards.
   */
  public checkTitle(title: string, dashboards: Dashboard[]): ValidationResult {
    return dashboards.some((dashboard: Dashboard) => dashboard.title === title)
      ? { errorMessage: "this.dictionary.InputAsTitleAlreadyExists", isValid: false }
      : this.checkValue(title);
  }

  /**
   * Validate link of a dashboard.
   * Check for duplicated in dashboards array.
   * @param link Link of the dashboard written by the user or generated automatically.
   * @param dashboards Array of already existing dashboards.
   */
  public checkLink(link: string, dashboards: Dashboard[]): ValidationResult {
    const validationResult = this.checkValue(link);
    const noWhiteSpaceAllowedRegex = new RegExp(/^[^\s]*$/);

    if (!noWhiteSpaceAllowedRegex.test(link)) {
      // return { errorMessage: this.dictionary.InputHasWhiteSpace, isValid: false };
    }

    if (dashboards.some((dashboard) => dashboard.link === link)) {
      return { errorMessage: "this.dictionary.InputAsLinkAlreadyExists", isValid: false };
    }

    return validationResult;
  }

  /**
   * Check the string value through Regular Expressions tests.
   * @param value Title or link written by the user or generated automatically.
   */
  private checkValue(value: string): ValidationResult {
    const isTrimmedRegex = new RegExp(/^[^\s]+(\s+[^\s]+)*$/);
    const allowedCharactersRegex = new RegExp(/^[A-Za-z0-9\s-]*$/);

    if (value.length === this.LETTERS_MIN_LIMIT) {
      return { errorMessage: "this.dictionary.InputIsEmpty", isValid: false };
    }

    if (!allowedCharactersRegex.test(value)) {
      return { errorMessage: "this.dictionary.InputHasInvalidCharacters", isValid: false };
    }

    if (value.length > this.LETTERS_MAX_LIMIT) {
      return { errorMessage: "this.dictionary.InputIsTooLong", isValid: false };
    }

    if (!isTrimmedRegex.test(value)) {
      return { errorMessage: "this.dictionary.InputStartsOrEndsWithSpace", isValid: false };

    }

    return { isValid: true };
  }
}
