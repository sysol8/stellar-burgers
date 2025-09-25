import { FC } from 'react';
import { AppHeaderUI } from '@ui';
import { getUserSelector } from '@slices';
import { useSelector } from '../../services/store';
import { useLocation } from 'react-router-dom';

export const AppHeader: FC = () => {
  const { user } = useSelector(getUserSelector);
  const location = useLocation();
  const background = (location.state as { background?: Location })?.background;

  return (
    <AppHeaderUI
      userName={user ? user.name : ''}
      backgroundLocation={background}
    />
  );
};
