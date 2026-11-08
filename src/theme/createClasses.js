import { themeConfig } from './themeConfig';

// ----------------------------------------------------------------------

export function createClasses(className) {
  return `${themeConfig.classesPrefix}__${className}`;
}
