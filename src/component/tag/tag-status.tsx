import {Tag} from "antd";
import React from "react";
import {TagStatusStyle} from "./tag-status.style";
interface TagStatusProps {
  type?: "nomarl" | "success" | "danger" | "primary" | "warning" | "secondary" | string;
  children: React.ReactNode;
  isOutline?: boolean;
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
  const {type, children, isOutline} = props;
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
      <Tag color={bgColor} style={{color: color}} className={isOutline ? "outline" :""}>
        {children}
      </Tag>
    </TagStatusStyle>
  );
}

export default TagStatus;