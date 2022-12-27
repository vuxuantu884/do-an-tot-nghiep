import { CallBackProps, STATUS } from 'react-joyride';
import React from "react";
import { TourGuide } from "component";
import { InventoryAdjustmentHelper } from "utils";

type ForwardRecordTourProps = {
  isRun: boolean,
  setIsRun: React.Dispatch<React.SetStateAction<boolean>>
};

const ForwardRecordTour = (props: ForwardRecordTourProps) => {
  const {
    isRun,
    setIsRun
  } = props;

  const steps = [
    {
      target: '.forward-step-one',
      content: <div>
        Cửa hàng bây giờ đã có thể thực hiện <span className="font-weight-500">Chuyển tiếp kho</span>
      </div>,
      disableBeacon: true
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const {status, action} = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setIsRun(false);
      return;
    }
    switch (action) {
      case InventoryAdjustmentHelper.ACTION_CALLBACK.CLOSE:
      case InventoryAdjustmentHelper.ACTION_CALLBACK.RESET:
        setIsRun(false);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <TourGuide
        disableScrolling
        floaterProps={{ disableAnimation: true }}
        callback={handleJoyrideCallback}
        steps={steps}
        run={isRun}
      />
    </>
  );
};

export default ForwardRecordTour;