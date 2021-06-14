import React, { useCallback, useEffect, useRef, useState } from "react";
import { CardProps, Card as ANTCard } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import classNames from "classnames";

interface IProps extends CardProps {
  collapse?: boolean;
  defaultopen?: boolean
}

const CustomCard = (props: IProps) => {
  const container = useRef<HTMLDivElement>(null);
  const { collapse, className, extra, defaultopen, ...rest } = props;

  const [collapsed, setCollapsed] = useState(defaultopen !== undefined ? !defaultopen : true);

  const handleHeaderCardClick = useCallback(
    () => {
      setCollapsed(!collapsed);
    },
    [collapsed],
  );

  useEffect(() => {
    const element = container.current?.querySelector<HTMLElement>(
      ".ant-card-collapse > .ant-card-head"
    );
    element?.addEventListener("click", handleHeaderCardClick);
    return () => {
      element?.removeEventListener("click", handleHeaderCardClick);
    };
  }, [collapsed, handleHeaderCardClick]);



  return (
    <div ref={container}>
      <ANTCard
        className={classNames(
          className,
          collapse && "ant-card-collapse",
          collapsed && "collapsed"
        )}
        {...rest}
        extra={collapse && (collapsed ? <RightOutlined /> : <DownOutlined />)}
      />
    </div>
  );
};

export default CustomCard;