import styled from "styled-components";

export const ChangePasswordStyle = styled.div`
  .change-password-container {
    display: grid;
    grid-template-areas:
      "password"
      "checklist"
      "confirm-password";
  }
  .password-input {
    grid-area: password;
    display: block;
  }
  .confirm-password-input {
    grid-area: confirm-password;
    display: block;
  }
  .password-check-list {
    grid-area: checklist;
    margin-bottom: 24px;
  }

  @media (min-width: 768px) {
    .change-password-container {
      grid-template-areas:
        "password checklist"
        "confirm-password checklist";
      grid-template-columns: 300px 1fr;
      column-gap: 24px;
      align-items: center;
    }
  }
`;
