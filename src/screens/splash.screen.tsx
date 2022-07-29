import React from "react";
import { Spin } from "antd";
import { Loading3QuartersOutlined } from "@ant-design/icons";

function SplashScreen() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spin indicator={<Loading3QuartersOutlined style={{ fontSize: 28 }} spin />} />
    </div>
  );
}

export default SplashScreen;
