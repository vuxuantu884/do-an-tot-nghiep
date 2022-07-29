import styled from "styled-components";

export const StyledComponent = styled.div`
  display: flex;
  width: 100%;
  padding: 0;
  .imageDeliveryService {
    width: 112px;
    height: 25px;
  }
  .saleorder-header-content {
    width: 100%;
  }
  .saleorder-header-content__info {
    display: flex;
    width: 100%;
  }
  .saleorder-header-content__date {
    display: none !important;
    width: 100%;
    align-items: center;
  }
  .buttonCopy {
    width: 35px;
    padding: 0 4px;
    margin-right: 10px;
    margin-bottom: 2px;
  }
  .fulfillmentCode {
    color: #2a2a86;
    font-weight: 500;
    font-size: 18px;
    margin-right: 11px;
  }
  .fulfillmentHeaderDateLabel {
    color: #000000d9;
    margin-right: 6px;
  }
  .fulfillmentHeaderDateValue {
    color: #000000d9;
  }
`;
