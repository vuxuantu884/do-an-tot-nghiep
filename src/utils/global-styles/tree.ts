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
    background-color: #ccc;
  }

  .ant-tree-select-dropdown .ant-select-tree-list-holder-inner {
    .ant-select-tree-checkbox {
      top: 6px;
    }
    .ant-select-tree-treenode {
      padding: 0;
    }
    .ant-select-tree-node-content-wrapper {
      padding: 7px 0px;
      position: relative;
      top: 1px;
      background: none;
    }
  }
  .ant-select-tree-switcher .ant-select-tree-switcher-icon {
    line-height: 38px;
  }
`;
