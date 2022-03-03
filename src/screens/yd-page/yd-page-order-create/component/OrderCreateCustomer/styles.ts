import styled from "styled-components";

export const StyledComponent = styled.div`
  .send-order-box {
    &-default {
        display: none;
    }
  }

  .page-filter-right {
    display: flex;
    justify-content: flex-end;
    & .page-cancel-address {
      display: flex;
      justify-content: center;
      height: 24px;
      padding: 0 15px;
      line-height: 24px;
      margin-right: 10px
    }

    & .page-ok-save-address {
      height: 24px;
      padding: 0 15px;
    }
  }

  @media screen and (max-width: 740px) {
    .ant-form-item-explain-error {
      display: none;
    }
  }

`