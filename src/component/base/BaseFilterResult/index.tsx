import React from "react";
import { Tag, TagProps } from "antd";
import isEmpty from "lodash/isEmpty";
import { CloseOutlined } from "@ant-design/icons";
import { StyledComponent } from "./styles";
import { BaseFilterTag } from "../../../model/base/base-filter-tag";

type BaseFilterResultProps = Omit<TagProps, "onClose"> & {
  data?: BaseFilterTag[];
  onClose: (index: number) => void;
};

function BaseFilterResult({ data = [], onClose, ...props }: BaseFilterResultProps) {
  return (
    <>
      {!isEmpty(data) && (
        <StyledComponent>
          {data?.map((item: BaseFilterTag, index) => (
            <Tag
              key={item.keyId}
              closable
              closeIcon={<CloseOutlined size={24} />}
              className="tag"
              {...props}
              onClose={() => onClose(index)}>
              {item.keyName}: {item.valueName}
            </Tag>
          ))}
        </StyledComponent>
      )}
    </>
  );
}

export default BaseFilterResult;
