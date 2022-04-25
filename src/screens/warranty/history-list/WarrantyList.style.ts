import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
.ant-btn.addIcon {
    border-radius: 5px;
    background-color: #DCDCF2;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
.warranty-status {
    cursor: pointer;
    text-align: center;
    .ant-tag {
        margin-bottom: 5px;
    }
    .tag-line-height {
        margin-top: 5px !important;
    }
}
.custom-table .ant-table.ant-table-middle .ant-table-thead > tr > th.ant-table-selection-column {
    padding-left: 0 !important;
    padding-right: 0 !important;
}
.custom-table .ant-table.ant-table-middle .ant-table-selection-column {
    padding-left: 0 !important;
    padding-right: 0 !important;
}
.custom-table .ant-table.ant-table-middle .ant-table-tbody > tr > td {
    padding-left: 5px;
    padding-right: 5px;
}
.columnId {
    font-size: 0.9em;
    a {
        font-weight: bold;
    }
}
.ant-btn-icon-only {
    border: none;
    background: none;
    width: 36px;
    padding: 0;
}
.warranty-status {
    .ant-tag {
        white-space: normal;
        font-size: 0.8em;
        text-align: center;
        line-height: 1.35;
    }
}
.fee {
    color: ${primaryColor};
    font-weight: bold;
}
.noFee {
    text-align: center;
}
.hasFee {
    text-align: right;
}
.isCanChange {
    cursor: pointer;
}
.ant-tabs-tab .number {
    padding: 2px 6px;
    border-radius: 20px;
    color: white;
    margin-left: 6px;
    font-size: 11px;
    position: relative;
    top: -1px;
}
`;
