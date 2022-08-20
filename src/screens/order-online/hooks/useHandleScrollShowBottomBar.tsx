import { useCallback, useEffect, useState } from "react";

function useHandleScrollShowBottomBar() {
  const [visibleBillStep, setVisibleBillStep] = useState({
    isShow: false,
    isAlreadyShow: false,
  });

  const handleScroll = useCallback(() => {
    const pageYOffsetToShow = 100;
    if (
      (window.pageYOffset > pageYOffsetToShow || visibleBillStep.isAlreadyShow) &&
      !visibleBillStep.isShow
    ) {
      setVisibleBillStep({
        isShow: true,
        isAlreadyShow: true,
      });
    }
  }, [visibleBillStep]);

  //windows offset
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return visibleBillStep;
}

export default useHandleScrollShowBottomBar;
