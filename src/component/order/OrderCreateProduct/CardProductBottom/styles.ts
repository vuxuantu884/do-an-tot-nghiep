import styled from "styled-components";
import {
  dangerColor,
  grayF5Color,
  primaryColor,
  successColor,
} from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  padding-top: 15px;

  .paymentRow {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
    .discountTitle,
    .couponTitle {
      text-decoration: underline;
      text-decoration-color: ${primaryColor};
      color: ${primaryColor};
    }
  }
  .optionRow {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }
  .ant-divider-horizontal {
    margin: 12px 0;
  }
  .noteTooltip {
    margin-left: 5px;
  }
  .discountTag {
    margin-top: 0;
    color: ${dangerColor};
    background: ${grayF5Color};
  }
  .couponTag {
    .ant-tag-close-icon {
      color: ${successColor};
    }
    &--danger {
      margin: 0;
      color: ${dangerColor};
      background: ${grayF5Color};
      text-transform: uppercase;
      .ant-tag-close-icon {
        color: ${dangerColor};
      }
    }
    &__icon {
      margin-right: 5px;
      color: ${successColor};
      &--danger {
        color: ${dangerColor};
      }
    }
  }
`;
