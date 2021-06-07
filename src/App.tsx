import { loadUserFromStorageAction } from 'domain/actions/app.action';
import { RootReducerType } from 'model/reducers/RootReducerType';
import moment from 'moment';
import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import MainRoute from 'routes';
import SplashScreen from 'screens/splash.screen';


function App() {
  const dispatch = useDispatch();
  const isLoad = useSelector((state: RootReducerType) => state.userReducer.isLoad)
  useEffect(() => {
    if(!isLoad) {
      dispatch(loadUserFromStorageAction());
    }
  }, [dispatch, isLoad])
  return (
    <Suspense fallback={<SplashScreen />}>
      <BrowserRouter basename="/unicorn/admin">
        <MainRoute />
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
