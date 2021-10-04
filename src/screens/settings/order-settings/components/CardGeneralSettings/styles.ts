import styled from "styled-components";

type PropType = {
  abc: boolean;
};

export const StyledComponent = styled.div`
  .ant-select {
    width: 100%;
  }
  .title {
    margin-bottom: 10px;
    color: ${(props: PropType) => {
      console.log("props", props);
      return props.abc ? "green" : "red";
    }};
  }
  .ant-radio-group {
    .single:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  .selectChonChoTatCaDonHang {
    width: 255px;
    max-width: 100%;
    margin-top: 25px;
    margin-left: 25px;
  }
`;
