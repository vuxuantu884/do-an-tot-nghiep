import styled from "styled-components";

export const InventoryDefectFilterWrapper = styled.div`
  margin-top: 15px;
  .tag {
    margin-bottom: 15px;
  }
`;

export const FilterDefectAdvWrapper = styled.div`
  .from-defect,
  .to-defect {
    margin: 10px 0px;
    width: 45%;
  }
  .ant-input-number {
    width: 100%;
  }
  .site-input-split {
    width: 10%;
    text-align: center;
    height: 38px;
    padding: 7px;
    margin-top: 10px;
  }
  .error-message {
    color: #ff4d4f;
  }
`;
