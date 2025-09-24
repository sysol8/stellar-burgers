import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { getOrders, getProfileOrders } from '@slices';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProfileOrders());
  }, [dispatch]);

  const orders = useSelector(getOrders);

  return <ProfileOrdersUI orders={orders} />;
};
