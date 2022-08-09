import { Tooltip } from "antd";
import React from "react";
import { capitalEachWords } from "utils/AppUtils";

type Props = {
  name: string;
};

export default function FullNameAccount({ name }: Props) {
  // cut name 50 character
  const cutName =
    (typeof name === "string" && name?.length > 50 ? name.substring(0, 50) + "..." : name) || "";
  return <Tooltip title={name}>{capitalEachWords(cutName)}</Tooltip>;
}
