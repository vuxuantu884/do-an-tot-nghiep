import styled from "styled-components";

export const ModalStyled = styled.div`
  .draggble-setting-column {
    cursor: move !important;
    .ant-list-item-action {
      .ant-btn-icon-only {
        .anticon {
          vertical-align: 0.325em;
        }
      }
      .ant-list-item-action-split {
        width: 0px;
      }
    }
  }
  .ant-select-auto-complete {
    margin-bottom: 10px;
  }
`;
