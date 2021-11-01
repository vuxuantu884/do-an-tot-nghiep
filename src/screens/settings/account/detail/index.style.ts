import Styled from "styled-components";

export const CreateRoleStyled = Styled.div`
.ant-card {
    border-radius: 0;
    box-shadow: none;
}
.ant-card-bordered {
    border: 0;
}
.ant-card-body{
    padding: 0px;
    .ant-collapse>.ant-collapse-item>.ant-collapse-header {
        padding: 12px 20px;
    }
    .ant-collapse-content-box{
        padding:0 16px 0 40px;
    }
}
`;
