import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .cardBottom {
    &-left {
      display: flex;
      align-items: center;
      strong {
        font-size: 1.286rem;
      }
      &__icon {
        margin-right: 10px;
      }
    }
    &-right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      &__button {
        margin-left: 18px;
        img {
          margin-right: 5px;
        }
      }
      &__text {
        font-style: italic;
        letter-spacing: -0.35px;
      }
    }
  }
  .ant-table {
    .ant-table-tbody > tr > td {
      border-right: 1px solid ${borderColor};
    }
    th {
      text-align: center !important;
    }
  }
`;
