import styled from "styled-components";

export const StyledComponent = styled.div`
  .row-detail {
    margin-bottom: 15px;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    width: 100%;
    &-left {
      width: 40%;
    }
    &-right {
      width: 60%;
    }
    .dot {
      margin-right: 10px;
    }
    .title {
      color: #666666;
    }
    .data {
      color: #222222;
      font-weight:500;
      word-break: break-word;
    }
  }
`;
