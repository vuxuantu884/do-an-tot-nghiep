import { CategoryResponse } from "model/product/category.model";
import { TreeSelect } from "antd";
import React from "react";
const { TreeNode } = TreeSelect;

const TreeCategory: React.FC<CategoryResponse> = (item: CategoryResponse) => {
  return (
    <TreeNode value={item.id} title={item.code ? `${item.code} - ${item.name}` : item.name}>
      {item.children.length > 0 && (
        <React.Fragment>
          {item.children.map((item, index) => (
            <React.Fragment key={index}>{TreeCategory(item)}</React.Fragment>
          ))}
        </React.Fragment>
      )}
    </TreeNode>
  );
};

export default TreeCategory;
