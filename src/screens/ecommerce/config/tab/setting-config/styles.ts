import styled from "styled-components";

export const StyledConfig = styled.div`
  .ant-row {
    width: 100%;
  }
  .ant-col {
    display: flex;
    flex-direction: column;
  }
  .ant-form-item {
    display: flex;
    flex-direction: column;
    margin: 0 0 14px;
  }
  label{
    
    font-weight: 500;
  }
  .description-name {
    display: block;
    line-height: 32px;
    font-weight: 500;
    font-size: 14px;
    color: #222222;
  }
  .description {
    display: block;
    height: 38px;
    font-weight: 300;
    font-size: 13px;
    color: #666666;
  }
  .customer-bottom-button{
    margin-left: -50px;
    button:first-child{
      color: red
    }
  }
`;
