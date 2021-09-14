import styled from "styled-components";

export const StyledComponent = styled.div`
  .list__variants {
    .ant-list-items {
      height: 450px;
      overflow: auto;
      .ant-list-item {
        height: 55px;
        border: none;
        padding-left: 10px;
        padding-right: 10px;
        &.active,
        &:hover {
          background: #f3f3ff;
          cursor: pointer;
        }
        .line-item {
          width: 100%;
          align-items: center;
          display: flex;
          flex-direction: row;
          &-container {
            width: 100%;
            margin-left: 10px;
            display: flex;
            flex-direction: row;
            align-items: center;
            .avatar {
              width: 40px;
              height: 45px;
              display: flex;
              margin-right: 10px;
              border-radius: 3px;
              img {
                width: 100%;
                height: auto;
                object-fit: cover;
                border-radius: 3px;
              }
              .not-salable {
                position: absolute;
                width: 40px;
                height: 45px;
                font-size: 10px;
                display: flex;
                color: white;
                text-align: center;
                border-radius: 3px;
                align-items: center;
                background-color: rgba(34, 34, 34, 0.7);
              }
            }
          }
        }
      }
    }
    .ant-list-header {
      border: none;
    }

    .header-tab {
      padding-left: 10px;
      padding-right: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: row;
      .action-button {
        border: 1px solid #E5E5E5;
        padding: 6px 15px;
        border-radius: 5px;
        flex-direction: row;
        display: flex;
        background-color: #F5F5F5;
        align-items: center;
        color: #666666;
        &:hover {
          border: 1px solid #E5E5E5;
          color: #666666;
          border: 1px solid #E5E5E5;
          background-color: #F5F5F5;
        }
        &:focus {
          border: 1px solid  #E5E5E5;
          color: #666666;
          border: 1px solid #E5E5E5;
          background-color: #F5F5F5;
        }
        &.ant-btn-primary {
          color: white;
        }
      }
    }
  }
`;
