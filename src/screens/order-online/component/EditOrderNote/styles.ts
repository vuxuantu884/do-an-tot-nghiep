import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-form-item-label>label {
		font-weight: normal;
	}
	.formInner {
		width: 300px;
		max-width: 100%;
	}
	.buttonWrapper {
		margin-top: 10px;
		display: flex;
		justify-content: flex-end;
		button {
			&:not(:last-child) {
				margin-right: 10px;
			}
		}
	}
	.iconEdit {
		margin-right: 5px;
		cursor: pointer;
	}
	.noteText{
		text-align: left;
	}
`;
