import styled from "styled-components";
import { borderColor, textMutedColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .revenueCard {
    .ant-card-body {
      padding-top: 0;
    }
    &__content {
      color: ${textMutedColor};
      padding: 20px 0;
      border-bottom: 1px solid ${borderColor};
      text-align: center;
      margin-bottom: 20px;
    }
    &__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
  .custom-table .ant-table.ant-table-middle .ant-table-thead {
    box-shadow: none;
  }
  .noWrap {
    white-space: nowrap;
  }
`;
