import styled from "styled-components";

export const PWFormFilter = styled.div`
  .date-option {
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 10px;

    & button {
      width: 30%;
    }
  }

  .ant-row {
    &.create-date {
      margin-top: 10px;
      margin-bottom: 20px;
    }
  }

  button.active {
    color: #FFFFFF;
    border-color: rgba(42, 42, 134, 0.1);
    background-color: #2A2A86;
  }

  button.deactive {
    color: #2a2a86;
    border-color: rgba(42, 42, 134, 0.05);
    background-color: rgba(42, 42, 134, 0.05);
  }

`;


export const ProductWrapperStyled = styled.div`
  .order-filter-tags .ant-tag.tag {
    padding: 10px 10px;
    margin-bottom: 20px;
    background: rgba(42, 42, 134, 0.05);
    border-radius: 50px;
  }
`;