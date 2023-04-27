import styled from "styled-components";
import { Radio, Col } from "antd";

export const RadioGroup = styled(Radio.Group)`
  width: 100%;
  padding-right: 0;
  overflow-y: scroll;

  height: 400px;

  .ant-space-vertical {
    width: 100%;
    padding-right: 10px;

    .ant-radio-wrapper {
      background-color: #fafafa;
      padding: 10px;
      width: 100%;
      position: relative;
      font-weight: 800;

      span:nth-child(2) {
        width: 97%;
      }

      span:nth-child(1) {
        width: 17px;
      }
    }

    .ant-radio-wrapper-checked {
      background-color: #f0f0fe;
      padding: 10px;
    }

    .ant-radio {
      position: absolute;
      right: 5px;
      top: 50%;
      -ms-transform: translateY(-50%);
      transform: translateY(-50%);
    }
  }
`;

export const ColAddGift = styled(Col)`
  padding-left: 10px;
  .gift-item-title {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .quantity-columns {
    width: 80px;
  }
  .quantity-columns input {
    text-align: left;
  }
  /* .gift-table-order-online {
    max-height: 500px;
    overflow: hidden;
    overflow-y: auto;
  } */
`;
