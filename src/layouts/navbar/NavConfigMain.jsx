import { SvgColor } from '../../components/image/svgColor/SvgColor';
import { paths } from '../../routes/paths';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
  user: icon('ic-user'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'Lin Universe',
    translateKey: 'menu.title',
    items: [
      {
        title: 'Home',
        translateKey: 'menu.home',
        path: paths.main.home,
        icon: ICONS.dashboard,
      },
    ],
  },
];
