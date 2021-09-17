import styled from "styled-components";

export const StyledComponent = styled.div`
  .avatar-list {
    height: 400px;
    overflow: auto;
    .ant-col {
      padding-right: 16px !important;
      .av-checkbox {
        position: absolute;
        bottom: 10px;
        right: 25px;
      }
    }
  }
  .avatar-show {
    width: 178px;
    height: 190px;
  }
`;
