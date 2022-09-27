import styled from "styled-components";

export const StyledWrapper = styled.div`
  .guide {
    line-height: 30px;
  }

  .ant-form-item-label>label:after {
    content: none;
  }
  
  .ant-upload-drag-icon svg {
    color: #2A2A86;
  }
  
  .search-link {
    text-decoration: underline;
    margin-left: 20px;
  }
  
  .import-info {
    ul {
      color: #FF0000; 
    }
  }
`;

export const ImportStatusWrapper = styled.div`
  .status {
    width: 85%;
    margin: 0 auto;
    .ant-col.ant-col-6 {
      text-align: center;
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
