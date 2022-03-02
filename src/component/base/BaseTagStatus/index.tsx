import React, { FC } from "react";
import { Tag, TagProps } from "antd";
import { StyledComponent } from "./styles";
import classNames from "classnames";

type BaseTagStatusProps = TagProps & {
  color?: "green" | "blue" | "gray" | undefined;
  fullWidth?: boolean;
};
const BaseTagStatus: FC<BaseTagStatusProps> = ({ children, color, fullWidth, ...props }) => {
  return (
    <StyledComponent>
      <Tag {...props} className={classNames("tag", `tag-${color}`, { full: fullWidth })}>
        {children}
      </Tag>
    </StyledComponent>
  );
};

export default BaseTagStatus;
