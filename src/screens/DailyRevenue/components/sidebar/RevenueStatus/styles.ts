import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .cardBottom {
    &-left {
      display: flex;
      align-items: center;
      &__icon {
        margin-right: 10px;
      }
    }
    &-right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      &__button {
        margin-left: 10px;
        img {
          margin-right: 5px;
        }
      }
      &__text {
        font-style: italic;
      }
    }
  }
  .ant-table .ant-table-tbody > tr > td {
    border-right: 1px solid ${borderColor};
  }
`;
