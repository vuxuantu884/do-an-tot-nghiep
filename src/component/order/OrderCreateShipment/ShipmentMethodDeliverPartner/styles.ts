import styled from "styled-components";

export const StyledComponent = styled.div`
  .logoHVC {
    height: 41px;
    width: 184px;
  }
  .addressError {
    margin: 0 0 10px 0;
    color: #ff4d4f;
  }
  .shipmentMethod {
    &__deliverPartner {
      margin-top: 20px;
    }
    &__note {
      margin: 10px 0;
      color: #ff4d4f;
    }
  }
  .custom-table {
    margin-top: 20px;
  }
  .deliverPartner {
    &__table {
      width: 100%;
      table-layout: auto;
    }
  }
  .cell {
    &__fee {
      text-align: right;
      padding: 0;
    }
  }
  .tableCell {
    padding: 8px 16px;
  }
  .disabledRadio {
    cursor: auto !important;
    .checkmark {
      background-color: #f0f0f0;
      border: none !important;
      cursor: normal;
    }
  }
  .serviceFeeInformation {
    padding: 0;
  }
`;
