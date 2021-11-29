import Styled from "styled-components";
export const AccountDetailStyle = Styled.div`
.table-detail {
    width: 100%;
    border-spacing:16px;
    border-collapse: separate;
    tr {
        vertical-align:top;
    }
}
.permission {
    &-account{
    margin-bottom: 20px;
    justify-content:space-between;
    }
}
.account-title {
    margin-right: 40px;
    white-space: nowrap;
    color:#737373
}
`;
