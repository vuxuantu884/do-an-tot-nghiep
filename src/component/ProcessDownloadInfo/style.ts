import styled from "styled-components";

export const StyledProgressDownloadInfo = styled.div`
  .progress-body {
    width: 80%;
    margin: 0 auto;
    .progress-count {
      display: flex;
      justify-content: space-between;
      text-align: center;
      .total-count {
        font-weight: 700;
        color: #222222;
      }
      .total-created {
        font-weight: 700;
        color: #fcaf17;
      }
      .total-updated {
        font-weight: 700;
        color: #27ae60;
      }
      .total-error {
        font-weight: 700;
        color: #e24343;
      }
    }
  }

  .error-orders {
    .title {
      margin: 20px 0;
      font-weight: bold;
    }
    .error_message {
      max-height: 300px;
      overflow-y: scroll;
    }
  }
`;
