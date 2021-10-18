import styled from "styled-components";

export const StyledPageHeaderWrapper = styled.div`
  position: absolute;
  z-index: 1001;
  top: -55px;
  width: 75%;
  height: 55px;
  display: flex;
  align-items: center;

  .ant-row {
    width: 100%;
    align-items: center;
    justify-content: space-between;
  }

  .step-content{
    position: absolute;
    right: 0;
  }
`;

export const LeftContentHeader = styled.div`
  font-size: 20px;
  margin-bottom: 4px;
  font-weight: bold;
`;


export const RightContentHeader = styled.div`
  .ant-steps-small .ant-steps-item-title {
    font-size: 15px;
  }
  transform: scale(0.6) translateX(40%);
`;