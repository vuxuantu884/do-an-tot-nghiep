import {Tag, TagProps} from "antd";
import React from "react";
import {TagStatusStyle} from "./tag-status.style";
import classnames from "classnames";

declare const TagTypes: ["nomarl", "success", "danger", "primary", "warning", "secondary"];
export declare type TagType = typeof TagTypes[number];
interface TagStatusProps extends TagProps {
  type?: TagType | string;
  children: React.ReactNode;
  isOutline?: boolean;
  icon?: string | undefined;
}

TagStatus.defaultProps = {
  type: "nomarl",
  isOutline: false,
};

export enum TagStatusType {
  nomarl = "nomarl",
  success = "success",
  danger = "danger",
  primary = "primary",
  warning = "warning",
  secondary = "secondary",
}
function TagStatus(props: TagStatusProps) {
  const { type, children, isOutline, icon, className } = props;
  let bgColor = "";
  let color = "";
  switch (type) {
    case "warning":
      bgColor = "#FFFAF0";
      color = "#FCAF17";
      break;
    case "success":
      bgColor = "#F0FCF5";
      color = "#27AE60";
      break;
    case "danger":
      bgColor = "rgba(226, 67, 67, 0.1)";
      color = "#E24343";
      break;
    case "primary":
      bgColor = "rgba(42, 42, 134, 0.1)";
      color = "#2A2A86";
      break;
    case "secondary":
      bgColor = "rgba(115, 115, 115, 0.2)";
      color = "#666666";
      break;
    case "nomarl":
    default:
      bgColor = "rgba(245, 245, 245, 1)";
      color = "#878790";
      break;
  }
  return (
    <TagStatusStyle>
      <Tag color={bgColor} style={{color: color, margin: 0}} className={classnames(isOutline ? "outline" :"", className) }>
        { icon && <img src={icon} alt="" style={{ marginRight: 4 }}/> }
        {children}
      </Tag>
    </TagStatusStyle>
  );
}

export default TagStatus;
