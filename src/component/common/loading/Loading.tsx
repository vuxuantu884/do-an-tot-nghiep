import React from "react";
import { Spin } from "antd";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import classNames from "classnames";

interface IProps {
  className?: string;
  fullscreen?: boolean;
}

export const Loading = (props: IProps) => {
  const { className = "", fullscreen } = props;
  return (
    <div className={classNames(className, fullscreen && "loading-fullscreen")}>
      <Spin
        indicator={<Loading3QuartersOutlined style={{ fontSize: 32 }} spin />}
      />
    </div>
  );
};
