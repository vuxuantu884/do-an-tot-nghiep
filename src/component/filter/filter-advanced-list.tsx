import React, { ReactNode } from "react";
import { Row } from "antd";

type FilterAdvancedListProps<T> = {
  data: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  spacing?: number;
};

function FilterAdvancedList<T>({
  data = [],
  renderItem = () => null,
  spacing = 16,
}: FilterAdvancedListProps<T>) {
  return (
    <>
      <Row gutter={spacing} style={{ margin: 0 }}>
        {data.map((item, index) => renderItem(item, index))}
      </Row>
    </>
  );
}

export default FilterAdvancedList;
