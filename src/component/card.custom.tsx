import React, { useCallback, useEffect, useRef, useState } from "react";
import { CardProps, Card as ANTCard } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import classNames from "classnames";

interface IProps extends CardProps {
  collapse?: boolean;
  defaultOpen?: boolean
}

const CustomCard = (props: IProps) => {
  const container = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(!props.defaultOpen);

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



  const { collapse, className, extra, ...rest } = props;
  return (
    <div ref={container}>
      <ANTCard
        className={classNames(
          className,
          collapse && "ant-card-collapse",
          collapsed && "collapsed"
        )}
        {...rest}
        extra={[
          extra,
          collapse && (collapsed ? <RightOutlined /> : <DownOutlined />),
        ]}
      />
    </div>
  );
};

export default CustomCard;