import { Navigate } from 'react-router-dom';
import { paths } from '../paths';

/** Public entry: send users to the app home (auth handled on private routes). */
export const publicRoutes = [
  {
    path: '/',
    element: <Navigate to={paths.main.home} replace />,
  },
];
