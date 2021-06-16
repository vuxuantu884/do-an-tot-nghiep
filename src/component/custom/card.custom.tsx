import React, { useCallback, useEffect, useRef, useState } from "react";
import { CardProps, Card as ANTCard } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import classNames from "classnames";

interface IProps extends CardProps {
  collapse?: boolean;
  defaultopen?: boolean
}

const CustomCard = (props: IProps) => {
  const { collapse, className, extra, defaultopen,  ...rest} = props;
  
  const container = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(!defaultopen);


  const calcHeight = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bodyElement = container.current?.querySelector<HTMLElement>('.ant-card-collapse > .ant-card-body');
        bodyElement && (bodyElement.style.height = `${bodyElement.scrollHeight}px`);
        resolve(true);
      }, 200);
    })
  }

  const handleHeaderCardClick = useCallback(
    () => {
      if (!collapsed) {
        calcHeight();
      }
      setCollapsed(!collapsed)
    },
    [collapsed]
  )
  useEffect(() => {
    const element = container.current?.querySelector<HTMLElement>(
      ".ant-card-collapse > .ant-card-head"
    );
    element?.addEventListener("click", handleHeaderCardClick);
    return () => {
      element?.removeEventListener("click", handleHeaderCardClick);
    };
  }, [handleHeaderCardClick]);
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
          collapse && (collapsed ? <RightOutlined key="collapse-icon" /> : <DownOutlined key="collapse-icon" />),
        ]}
      />
    </div>
  );
};

export default CustomCard;