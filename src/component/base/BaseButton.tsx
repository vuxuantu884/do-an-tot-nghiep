import React, { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import Button, { ButtonProps } from "antd/lib/button/button";

type BaseButtonProps<T> = ButtonProps & {
  children?: ReactNode;
  as?: T;
};

function BaseButton<T extends ElementType = typeof Button>({
  as,
  children,
  type = "default",
  size = "small",
  ...props
}: BaseButtonProps<T> & ComponentPropsWithoutRef<T>) {
  const Component = as || Button;
  return (
    <>
      <Component
        size={size}
        type={type}
        {...props}
        style={{ display: "flex", alignItems: "center", ...props.style }}
      >
        <span style={{ marginLeft: props.icon ? "8px" : 0 }}>{children}</span>
      </Component>
    </>
  );
}

export default BaseButton;
