import DataDog from "component/DataDog";
import { BASE_NAME_ROUTER } from "config/url.config";
import { loadSettingAppAction, loadUserFromStorageAction } from "domain/actions/app.action";
import { profilePermissionAction } from "domain/actions/auth/permission.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import MainRoute from "routes";
import { GlobalStyle } from "utils/global-styles";
import SplashScreen from "./screens/splash.screen";

function App() {
  const dispatch = useDispatch();
  const isLoad = useSelector((state: RootReducerType) => {
    return state.userReducer.isLoad;
  });

  const user_id = useSelector((state: RootReducerType) => state.userReducer.account?.user_id);

  useEffect(() => {
    if (!isLoad) {
      dispatch(loadUserFromStorageAction());
      dispatch(loadSettingAppAction());
    }
  }, [dispatch, isLoad]);

  /**
   * @description: load permission for user
   */
  useEffect(() => {
    if (user_id) {
      dispatch(profilePermissionAction(user_id));
    }
  }, [dispatch, user_id]);

  return (
    <>
      <BrowserRouter basename={BASE_NAME_ROUTER}>
        <Suspense fallback={<SplashScreen />}>
          <DataDog />
          <MainRoute />
        </Suspense>
        <GlobalStyle />
      </BrowserRouter>
    </>
  );
}

export default App;
