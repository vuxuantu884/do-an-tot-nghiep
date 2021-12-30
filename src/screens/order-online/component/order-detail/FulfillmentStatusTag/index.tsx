import { Tag } from "antd";
import { FulFillmentResponse } from "model/response/order/order.response";
import React from "react";
import { FulFillmentStatus } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropType = {
  fulfillment: FulFillmentResponse | null | undefined;
};

const FulfillmentStatusTag: React.FC<PropType> = (props: PropType) => {
  const { fulfillment } = props;
  const listStatusTagWithReturning = [
    {
      statusBeforeCancellation: FulFillmentStatus.SHIPPING,
      name: "Hủy đơn giao - Chưa nhận hàng",
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
    },
    {
      statusBeforeCancellation: FulFillmentStatus.SHIPPED,
      name: "Hủy đơn giao - Đã nhận hàng",
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
    },
  ];
  const listStatusTagWithReturned = [
    {
      statusBeforeCancellation: FulFillmentStatus.UNSHIPPED,
      name: "Hủy đơn giao",
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
    },
    {
      statusBeforeCancellation: FulFillmentStatus.PICKED,
      name: "Hủy đơn giao ",
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
    },
    {
      statusBeforeCancellation: FulFillmentStatus.PACKED,
      name: "Hủy đơn giao ",
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
    },
    {
      statusBeforeCancellation: FulFillmentStatus.SHIPPING,
      name: "Hủy đơn giao - Đã nhận hàng",
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
    },
  ];
  const listStatusTagWithoutReturn = [
    {
      name: "Chưa giao hàng",
      status: FulFillmentStatus.UNSHIPPED,
      color: "#666666",
      backgroundColor: "rgba(102, 102, 102, 0.1)",
    },
    {
      name: "Đang nhặt hàng",
      status: FulFillmentStatus.PICKED,
      color: "#FCAF17",
      backgroundColor: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đã đóng gói",
      status: FulFillmentStatus.PACKED,
      color: "#FCAF17",
      backgroundColor: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đang giao hàng",
      status: FulFillmentStatus.SHIPPING,
      color: "#FCAF17",
      backgroundColor: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đã giao hàng",
      status: FulFillmentStatus.SHIPPED,
      color: "#27AE60",
      backgroundColor: "rgba(39, 174, 96, 0.1)",
    },
  ];

  const findStatusTagWithReturning = () => {
    if (!fulfillment) {
      return;
    }
    return listStatusTagWithReturning.find((singleStatusTag) => {
      return (
        singleStatusTag.statusBeforeCancellation ===
        fulfillment.status_before_cancellation
      );
    });
  };

  const findStatusTagWithReturnedOrCancel = () => {
    if (!fulfillment) {
      return;
    }
    return listStatusTagWithReturned.find((singleStatusTag) => {
      return (
        singleStatusTag.statusBeforeCancellation ===
        fulfillment.status_before_cancellation
      );
    });
  };
  const findStatusTagWithoutReturnOrCancel = () => {
    if (!fulfillment) {
      return;
    }
    return listStatusTagWithoutReturn.find((singleStatusTag) => {
      return singleStatusTag.status === fulfillment.status;
    });
  };

  const renderStatusTag = () => {
    if (!fulfillment) {
      return;
    }
    let statusTag = null;
    switch (fulfillment?.status) {
      case FulFillmentStatus.RETURNING:
        statusTag = findStatusTagWithReturning();
        break;
      case FulFillmentStatus.RETURNED:
        statusTag = findStatusTagWithReturnedOrCancel();
        break;
      case FulFillmentStatus.CANCELLED:
        statusTag = findStatusTagWithReturnedOrCancel();
        break;
      default:
        statusTag = findStatusTagWithoutReturnOrCancel();
        break;
    }
    if (statusTag) {
      return (
        <Tag
          key={statusTag.name}
          className="orders-tag text-menu"
          style={{
            color: `${statusTag.color}`,
            backgroundColor: `${statusTag.backgroundColor}`,
          }}
        >
          {statusTag.name}
        </Tag>
      );
    }
  };

  return <StyledComponent>{renderStatusTag()}</StyledComponent>;
};

export default FulfillmentStatusTag;
