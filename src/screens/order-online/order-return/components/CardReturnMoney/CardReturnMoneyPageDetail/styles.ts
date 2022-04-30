import styled from "styled-components";

export const StyledComponent = styled.div`
	.ant-timeline-item:first-child {
		> .ant-timeline-item-tail {
			top: -6px;
		}
	}
  .ant-timeline-item-last {
		padding-bottom: 0;
		> .ant-timeline-item-tail {
			display: block;
		}
		.ant-timeline-item-content {
			min-height: 0;
		}
	}
  .ant-timeline-item-head {
    background: #27ae60;
  }
`;
