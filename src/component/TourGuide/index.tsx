import Joyride, { Props, TooltipRenderProps } from 'react-joyride';
import { Button } from "antd";
import React, { useEffect, useRef } from "react";
import { TourGuideStyled } from "./styles";

const KEY = {
  ARROW_RIGHT: "ArrowRight",
  ARROW_LEFT: "ArrowLeft",
  ESC: "Escape",
  SPACE: "Space"
};

const MOUSE_ACTION = {
  RIGHT_CLICK: 2
};

const TourGuide = (props: Props) => {
  const previousRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case KEY.ARROW_RIGHT:
      case KEY.SPACE:
        nextRef?.current?.click();
        break;
      case KEY.ARROW_LEFT:
        previousRef?.current?.click();
        break;
      case KEY.ESC:
        closeRef?.current?.click();
        break;
      default:
        break;
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (e.button === MOUSE_ACTION.RIGHT_CLICK) {
      closeRef?.current?.click();
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", handleKeyPress);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keyup", handleKeyPress);
      window.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const customTooltip = (options: TooltipRenderProps) => {
    const {
      index,
      size,
      step,
      backProps,
      primaryProps,
      tooltipProps,
      isLastStep,
      skipProps
    } = options;

    return (
      <TourGuideStyled {...tooltipProps}>
        <div className="wrapper">
          <div className="wrapper-icon"><span className="close-icon" ref={closeRef} {...skipProps}>[ESC] <span className="word-underline">Bỏ qua</span></span></div>
          <div className="content">
            {step.content}
          </div>
          <div className="footer">
            <Button className={index !== 0 ? "" : "hidden"} ref={previousRef} type="ghost" {...backProps}>Lùi</Button>
            <div>{index + 1} / {size}</div>
            <Button type="primary" ref={nextRef} {...primaryProps}>{isLastStep ? "Đóng" : "Tiếp"}</Button>
          </div>
        </div>
      </TourGuideStyled>
    )
  };

  return (
    <Joyride
      continuous
      showProgress
      disableCloseOnEsc={true}
      disableOverlayClose={true}
      tooltipComponent={customTooltip}
      styles={{
        options: {
          zIndex: 10000,
        }
      }}
      {...props}
    />
  );
};

export default TourGuide;