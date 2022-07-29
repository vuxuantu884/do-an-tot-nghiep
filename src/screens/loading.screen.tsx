import { Spin } from "antd";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";

const LoadingScreen = () => {
  const loading = useSelector((state: RootReducerType) => state.loadingReducer);
  if (!loading.isVisible) return null;
  return (
    <div className="loading">
      <Spin indicator={<Loading3QuartersOutlined style={{ fontSize: 28 }} spin />} />
    </div>
  );
};

export default LoadingScreen;
