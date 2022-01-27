import styled from "styled-components";

export const StyledComponent = styled.div`
    .procurement-code {
        color: #5656A2;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
            color: #1890ff;
        }

        &--disable {
            cursor: no-drop; 
        }
    }
    .page-filter{
        padding: 0px;
    }
    .warning-confirm{
        word-break: break-word;
    }
`;