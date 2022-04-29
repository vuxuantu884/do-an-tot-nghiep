import styled from "styled-components";

export const StyledSmsSetting = styled.div`
  .sms-settings {
    .row-item {
      display: flex;
      justify-content: space-between;
      .ant-form-item {
        margin-bottom: 20px;
      }
      &:last-child {
        .ant-form-item {
          margin-bottom: 0;
        }
      }
      .left-item {
        width: 50%;
        margin-right: 15px;
      }
      .right-item {
        width: 50%;
        margin-left: 15px;
      }
    }
  }
`;

export const StyledSmsConfigMessage = styled.div`
  .sms-config-message {
    display: flex;
    justify-content: space-between;
		.edit-content {
			width: 65%;
			margin-right: 20px;
			.action-status {
        flex-direction: row;
        align-items: center;
        .ant-form-item-label {
					padding: 0;
				}
				.switch-button {
					margin: 0 10px;
				}
			}
		}
		.key-word-list {
			flex-grow: 1;
			.key-word-item {
        display: flex;
        justify-content: space-between;
				margin-bottom: 10px;
				.insert-button {
					height: 32px;
					line-height: 32px;
				}
			}
		}
  }
`;

