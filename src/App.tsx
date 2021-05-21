import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainRoute from 'routes';
import SplashScreen from 'screens/splash.screen';


function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <BrowserRouter basename="/unicorn/admin">
        <MainRoute />
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
