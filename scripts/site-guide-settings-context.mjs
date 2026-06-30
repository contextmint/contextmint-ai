/**
 * Settings Q&A context for site guide matcher (re-export from question catalog).
 */
import {
  SETTINGS_QUESTION_CATALOG,
  flattenSettingsContext,
} from "./site-guide-settings-questions.mjs";

export { SETTINGS_QUESTION_CATALOG };
export const SETTINGS_CONTEXT = flattenSettingsContext();
