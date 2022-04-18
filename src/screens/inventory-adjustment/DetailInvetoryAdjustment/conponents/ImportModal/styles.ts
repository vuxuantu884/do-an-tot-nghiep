import styled from "styled-components";

export const ImportStatusWrapper = styled.div`
  .status {
    width: 85%;
    margin: 0 auto;
    .ant-col.ant-col-6 {
      text-align: center;
    }
    margin-bottom: 30px;
  }

  .import-info {
    flex-direction: column;
    text-align: left;

    & .content {
      padding: 10px 15px;
      margin-top: 30px;
      background-color: #F5F5F5;
      max-width: 100%;

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
  
  .ant-upload-list-item-name {
    overflow: hidden !important;
    text-overflow: ellipsis;
    max-width: 100%;
    width: 200px;
  }
`;
