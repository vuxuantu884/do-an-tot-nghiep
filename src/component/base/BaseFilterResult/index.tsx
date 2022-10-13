import React from "react";
import { Tag, TagProps } from "antd";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { CloseOutlined } from "@ant-design/icons";
import { StyledComponent } from "./styles";
import { BaseFilterTag } from "../../../model/base/base-filter-tag";
import TextShowMore from "component/container/show-more/text-show-more";

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
              key={`${item.keyId}-${item.valueId}-${index}`}
              closable
              closeIcon={<CloseOutlined size={24} />}
              className="tag"
              {...props}
              onClose={() => onClose(index)}
            >
              <TextShowMore>{`${item.keyName}: ${item.valueName}`}</TextShowMore>
            </Tag>
          ))}
        </StyledComponent>
      )}
    </>
  );
}

export default React.memo(BaseFilterResult, isEqual);
