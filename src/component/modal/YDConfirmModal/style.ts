import styled from "styled-components";
import { EnumConfirmModalType } from "utils/Constants";

type ModalStyledProps = {
  type?: "success" | "warning" | "error" | "info";
};

const colorMappingType = {
  [EnumConfirmModalType.SUCCESS]: "#27ae60",
  [EnumConfirmModalType.WARNING]: "#fcaf17",
  [EnumConfirmModalType.ERROR]: "#e24343",
  [EnumConfirmModalType.INFO]: "#75757b",
};

export const YDConfirmModalStyled = styled.div<ModalStyledProps>`
  .modal-body {
    display: flex;
    align-items: center;
  }
  .modal-icon {
    font-size: 40px;
    min-width: 70px;
    min-height: 70px;
    color: white;
    border-radius: 50%;
    margin-right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${(props) => (props.type ? colorMappingType[props.type] : "#75757b")};
  }
  .modal-subtitle {
    font-size: 16px;
    margin-bottom: 5px;
  }
`;
