import styled from "styled-components";

export const StyledComponent = styled.div`
  .warranty-filter {
    .page-filter {
      padding-top: 0;
      .page-filter-heading {
        width: 100%;
        display: inline-flex;
        justify-content: space-between;
        .page-filter-left {
          width: 8%;
          min-width: 100px;
        }
        .page-filter-right {
          width: 88%;
          padding-left: 20px;
          .ant-space.ant-space-horizontal {
            width: 100%;
            .ant-space-item {
              width: 100%;

              .ant-form.ant-form-inline {
                position: relative;
                padding-right: 150px;
                display: block;
                .buttonGroup {
                  position: absolute;
                  top: 0;
                  z-index: 1;
                  right: 0;
                  display: flex;
                  align-items: center;
                  button {
                    margin-right: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  [role="img"] {
                    vertical-align: middle;
                  }
                }
                .input-search {
                  width: 100%;
                }
              }
            }
          }
        }
      }
    }
  }
`;
