import styled from "styled-components";

export const StyledComponent = styled.div`
  .unichat-customer-note {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 0px;
    max-height: 144px;
    overflow: auto;
    .ant-tag {
      min-height: 22px;
      background: #f0f0fe;
      border: 1px solid #d6d6f8;
      border-radius: 2px;
      span {
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        color: #2a2a86;
      }
      .ant-tag-close-icon {
        svg {
          border-radius: 50%;
          background: #a5adba;
          color: white;
          padding: 2px;
        }
      }
    }
    .new-note-tag {
      background: #fff;
      border: 1px dashed #d9d9d9;
      color: #8c8c8c;
      span {
        color: #8c8c8c;
      }
    }
    .tag-input {
      width: auto;
      margin-right: 8px;
      vertical-align: top;
    }
  }
`;
