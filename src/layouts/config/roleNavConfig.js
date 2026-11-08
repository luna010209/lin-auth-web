/**
 * Navigation configuration by role (Lin Auth — minimal until feature modules land).
 */

import { SvgColor } from '../../components/image/svgColor/SvgColor';
import { CONFIG } from '../../globalConfig';
import { paths } from '../../routes/paths';
import { VISIBLE_MENU_ITEMS } from './roleConfig';

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
};

const ALL_MENU_ITEMS = {
  home: {
    subheader: 'Lin Universe',
    translateKey: 'menu.title',
    items: [
      {
        title: 'Home',
        translateKey: 'menu.home',
        path: paths.main.home,
        icon: ICONS.dashboard,
      },
      {
        title: 'Personas',
        translateKey: 'menu.personas',
        path: paths.persona.manage,
        icon: ICONS.dashboard,
      },
    ],
  },
};

export const getNavConfigByRole = (role = 'BASIC') => {
  const visibleItems = VISIBLE_MENU_ITEMS[role] || VISIBLE_MENU_ITEMS.BASIC;

  return visibleItems
    .map((key) => ALL_MENU_ITEMS[key])
    .filter(Boolean);
};

export const getAdminNavConfig = () => [
  {
    subheader: 'Admin',
    translateKey: 'menu.title',
    items: [
      {
        title: 'Dashboard',
        translateKey: 'menu.dashboard',
        path: paths.admin.dashboard,
        icon: ICONS.dashboard,
      },
    ],
  },
];
