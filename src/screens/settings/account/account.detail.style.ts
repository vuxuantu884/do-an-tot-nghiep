import Styled from "styled-components";
export const AccountDetailStyle = Styled.div`
.table-detail{
    width: 100%;
    border-spacing:16px;
    border-collapse: separate;
    tr {
        vertical-align:top;
    }
}

 .permission{
     .col-info{
         min-width: 320px;
     }
     &-account{
        margin-bottom: 20px;
        justify-content:space-between;
     }
 }
.account-title{
    white-space: nowrap;
    color:#737373
}
`;
