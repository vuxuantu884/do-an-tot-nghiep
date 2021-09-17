import styled from "styled-components";

export const ProductImportScreenStyled = styled.div`
  .ant-tabs {
    .ant-tabs-tabpane {
      padding: 20px;
    }
  }

  .ant-card{
    margin-bottom: 20px;
  }

  .ant-card-body {
    padding: 24px;
  }
  .ant-form-vertical .ant-form-item {
    flex-direction: row;
    align-items: center;

    .ant-form-item-label {
      padding: 0;
      margin-right: 30px;
    }

    &.note_item {
      flex-direction: column;
      align-items: flex-start;

      .ant-form-item-label {
        margin-bottom: 10px;
      }

      .ant-form-item-control{
        width: 100%;
      }
    }
  }

`;
