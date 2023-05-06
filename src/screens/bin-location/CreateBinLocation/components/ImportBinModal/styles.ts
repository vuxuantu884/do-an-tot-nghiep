import styled from "styled-components";

export const ModalImportWrapper = styled.div`
  .status {
    width: 85%;
    margin: 35px auto 0px;
    .ant-col.ant-col-6 {
      text-align: center;
    }
  }

  .sample-title {
    &-link {
      font-weight: 500;
    }
    &-template {
      margin-top: 10px;
    }
  }

  .ant-upload-text {
    color: rgba(0, 0, 0, 0.85);
  }

  .import-info {
    flex-direction: column;
    text-align: left;
    margin-top: 30px;
    max-width: 100%;

    & .content {
      padding: 10px 15px;
      background-color: #f5f5f5;

      ul {
        list-style: none;
        li {
          span {
            &.danger {
              color: #ff4d4f;
            }
            &.success {
              color: #52c41a;
            }
            margin-right: 10px;
          }
        }
      }
    }
  }
`;
