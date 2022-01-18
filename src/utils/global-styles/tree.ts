import { css } from "styled-components";
import { primaryColor } from "./variables";

export const globalCssCustomCheckbox = css`
  .ant-select-tree-checkbox-checked .ant-select-tree-checkbox-inner {
    background-color: ${primaryColor};
    border-color: ${primaryColor};
  }

  checkbox:hover .ant-select-tree-checkbox-inner {
    border-color: ${primaryColor};
  }

  .ant-select-tree-checkbox:hover .ant-select-tree-checkbox-inner {
    border-color: ${primaryColor};
  }
  
  .ant-tree-select-dropdown .ant-select-tree-list-holder-inner .ant-select-tree-treenode:hover {
    background-color: #f5f5f5;
}
`;
