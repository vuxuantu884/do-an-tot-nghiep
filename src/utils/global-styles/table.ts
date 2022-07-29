import { css } from "styled-components";
import { borderColor, grayF5Color, textBodyColor } from "./variables";

export const globalCssCustomTable = css`
  .ant {
    &-table {
      font-size: 1rem;
      &-selection-column {
        padding-right: 20px !important;
        padding-left: 20px !important;
      }
      &-thead {
        & > tr > th {
          color: ${textBodyColor};
          font-weight: 600;
          background: ${grayF5Color};
          border-bottom: 2px solid ${borderColor};
          padding: 10px 16px;
          /* &::before {
          content: unset !important;
        } */
        }
      }
      &-tbody {
        // & > tr:nth-child(2n) > td {
        //   background-color: rgba($background-color-secondary, 0.5);
        // }
        & > tr.ant-table-row-selected > td {
          // background-color: inherit;
        }
        > tr > td {
          border-bottom: 1px solid ${borderColor};
        }
      }

      .ant-table-cell-with-append {
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-end;
        align-items: center;
      }
    }
  }
`;
