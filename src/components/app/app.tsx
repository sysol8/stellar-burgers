import {
  ConstructorPage,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import { Feed } from '@pages';
import '../../index.css';
import styles from './app.module.css';
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Location
} from 'react-router-dom';
import {
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute
} from '@components';

import { AppHeader } from '@components';
import { Provider } from 'react-redux';
import store, { useDispatch, useSelector } from '../../services/store';
import { getUser, getUserSelector, markAuthChecked } from '@slices';
import { getIngredients } from '@slices';
import { useEffect } from 'react';
import { getCookie } from '../../utils/cookie';

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { background?: Location };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getIngredients());

    const hasAuth =
      !!getCookie('accessToken') || !!localStorage.getItem('refreshToken');

    if (hasAuth) {
      dispatch(getUser());
    } else {
      dispatch(markAuthChecked());
    }
  }, []);

  const closeModal = () => {
    if (state?.background) navigate(-1);
    else navigate('/', { replace: true });
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={state?.background || location}>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/feed/:number' element={<OrderInfo />} />
        <Route path='/ingredients/:id' element={<IngredientDetails />} />
        <Route element={<ProtectedRoute require='guest' />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
        </Route>
        <Route element={<ProtectedRoute require='auth' />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/orders' element={<ProfileOrders />} />
          <Route path='/profile/orders/:number' element={<OrderInfo />} />
        </Route>
        <Route path='*' element={<NotFound404 />} />
      </Routes>
      {state?.background && (
        <Routes>
          <Route
            path='/feed/:number'
            element={
              <Modal title={''} onClose={closeModal}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/ingredients/:id'
            element={
              <Modal title={'Детали ингредиента'} onClose={closeModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route element={<ProtectedRoute require='auth' />}>
            <Route
              path='/profile/orders/:number'
              element={
                <Modal title={''} onClose={closeModal}>
                  <OrderInfo />
                </Modal>
              }
            />
          </Route>
        </Routes>
      )}
    </div>
  );
}

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </Provider>
);

export default App;
