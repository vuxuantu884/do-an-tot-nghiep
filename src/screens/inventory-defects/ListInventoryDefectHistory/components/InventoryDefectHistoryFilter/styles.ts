import styled from "styled-components";

export const DefectHistoryFilterWrapper = styled.div`
  margin-top: 15px;
  margin-bottom: 25px;
  .tag {
    margin-top: 15px;
  }
`;

export const FilterDefectHistoryAdvWrapper = styled.div`
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
