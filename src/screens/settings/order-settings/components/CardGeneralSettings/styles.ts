import styled from "styled-components";

export const StyledComponent = styled.div`
  .title {
    margin-bottom: 15px;
  }
  .ant-select {
    width: 100%;
  }
  .ant-switch {
    margin-right: 15px;
  }
  .ant-radio-group,
	.ant-checkbox-group {
    .single:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  .selectChonChoTatCaDonHang {
    width: 255px;
    max-width: 100%;
    margin-top: 10px;
    margin-left: 25px;
  }
  .singleSetting {
    &:not(:last-child) {
      margin-bottom: 25px;
    }
  }
  .selectInNhieuDonHang {
    width: 330px;
    max-width: 100%;
  }
  
`;
