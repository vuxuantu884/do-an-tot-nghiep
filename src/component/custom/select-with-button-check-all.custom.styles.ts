import styled from "styled-components";


export const StyledComponent = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  .ant-checkbox-wrapper {
    position: absolute;
    z-index: 4;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    margin-right: 5px;
  }
  .ant-select-selector {
    padding-left: 30px !important;
  }
  .ant-select-selection-placeholder {
    left: 30px !important;
  }
`;

