import { loadUserFromStorageAction } from 'domain/actions/app.action';
import React, { Suspense, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import MainRoute from 'routes';
import SplashScreen from 'screens/splash.screen';


function App() {
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    dispatch(loadUserFromStorageAction());
  }, [dispatch])
  return (
    <Suspense fallback={<SplashScreen />}>
      <BrowserRouter basename="/unicorn/admin">
        <MainRoute />
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
