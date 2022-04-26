import styled from "styled-components";

export const StyledComponent = styled.div`
.table-info {
    width: 100%;
    tr {
        height: 35px;
    }
}
.cardCustomer {
    .single {
        &:not(:last-child) {
            margin-bottom: 10px;
        }
        img {
            margin-right: 5px;
            position: relative;
            top: -2px;
        }
    }
}
.cardInformation,
.cardProduct {
    .ant-row {
        &:not(:last-child) {
            margin-bottom: 10px;
        }
    }
}
`;
