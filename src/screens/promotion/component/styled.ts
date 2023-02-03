import styled from "styled-components";

export const PromotionStatusStyle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  .promotion-status {
    font-weight: 600;
    font-size: 14px;
    line-height: 22px;
    border-radius: 2px;
    height: 24px;
    padding: 1px 8px;
  }
  .active {
    border: 1px solid #B0B0F2;
    background: #F0F0FE;
    color: #2A2A86;
  }
  .disabled {
    border: 1px solid #FFA39E;
    background: #FFF1F0;
    color: #F5222D;
  }
  .draft {
    border: 1px solid #FFE58F;
    background: #FFFBE6;
    color: #FAAD14;
  }
  .pending {
    border: 1px solid #D9D9D9;
    background: #FAFAFA;
    color: #262626;
  }
  .cancelled {
    border: 1px solid #FFA39E;
    background: #FFF1F0;
    color: #F5222D;
  }
`;
