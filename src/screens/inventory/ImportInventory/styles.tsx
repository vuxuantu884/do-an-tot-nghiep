import styled from "styled-components";

export const StyledWrapper = styled.div`
 
`;

export const ImportStatusWrapper = styled.div`
  .status {
    width: 85%;
    margin: 0 auto;
    .ant-col.ant-col-6 {
      text-align: center;
    }
  }

  .import-info {
    flex-direction: column;
    text-align: left;
    margin-top: 30px;
    max-width: 100%;

    & .content {
      padding: 10px 15px;
      background-color: #F5F5F5;

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
