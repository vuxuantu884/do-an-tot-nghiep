import copyFileBtn from "assets/icon/copyfile_btn.svg";
import React from "react";
import { copyTextToClipboard } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  copiedText: string;
  informationText?: string;
  titleText?: string;
};

/**
 * copiedText: text cần copy
 * informationText: text thông báo
 * titleText: title button
 */
function CopyIcon(props: PropTypes): JSX.Element {
  const { copiedText, informationText, titleText } = props;

  const handleClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    copyTextToClipboard(e, copiedText!);
    if (informationText) {
      showSuccess(informationText);
    }
  };

  return (
    <StyledComponent>
      <img
        onClick={(e) => {
          handleClick(e);
        }}
        src={copyFileBtn}
        alt=""
        className="iconCopy"
        title={titleText}
      />
    </StyledComponent>
  );
}

export default CopyIcon;
