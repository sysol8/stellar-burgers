import { Preloader } from '@ui';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { getUserSelector } from '@slices';

interface ProtectedRouteProps {
  require?: 'auth' | 'guest' | 'public';
  redirectTo?: string;
}

export const ProtectedRoute = ({
  require = 'auth',
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const { user, isAuthChecked } = useSelector(getUserSelector);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (require === 'auth' && !user) {
    return (
      <Navigate
        to={redirectTo ?? '/login'}
        replace
        state={{ from: location }}
      />
    );
  }

  if (require === 'guest' && user) {
    const locationFrom = (location.state as { from?: Location })?.from ?? {
      pathname: '/'
    };
    return <Navigate to={locationFrom} replace />;
  }

  return <Outlet />;
};
