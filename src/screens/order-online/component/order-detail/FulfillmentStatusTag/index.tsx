import { Tag } from "antd";
import { FulFillmentResponse } from "model/response/order/order.response";
import React from "react";
import { FulFillmentReturnStatus, FulFillmentStatus } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  fulfillment: FulFillmentResponse | null | undefined;
};

function FulfillmentStatusTag(props: PropTypes) {
  const { fulfillment } = props;
  // const listStatusTagWithReturning = [
  //   {
  //     statusBeforeCancellation: FulFillmentStatus.SHIPPING,
  //     name: "Hủy đơn giao - Chưa nhận hàng",
  //     color: "#E24343",
  //     backgroundColor: "rgba(226, 67, 67, 0.1)",
  //   },
  //   {
  //     statusBeforeCancellation: FulFillmentStatus.SHIPPED,
  //     name: "Hủy đơn giao - Chưa nhận hàng",
  //     color: "#E24343",
  //     backgroundColor: "rgba(226, 67, 67, 0.1)",
  //   },
  //   {
  //     statusBeforeCancellation: FulFillmentStatus.SHIPPED,
  //     name: "Hủy đơn giao - Chưa nhận hàng",
  //     color: "#E24343",
  //     backgroundColor: "rgba(226, 67, 67, 0.1)",
  //   },
  //   {
  //     statusBeforeCancellation: FulFillmentStatus.SHIPPED,
  //     name: "Hủy đơn giao - Chưa nhận hàng",
  //     color: "#E24343",
  //     backgroundColor: "rgba(226, 67, 67, 0.1)",
  //   },
  // ];
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
    {
      name: "Hủy đơn giao",
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
      isDefault: true,
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
    return {
      name: "Hủy đơn giao - Chưa nhận hàng",
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
    };
  };

  const findStatusTagWithReturnedOrCancel = () => {
    if (!fulfillment) {
      return;
    }
    let result = listStatusTagWithReturned.find((singleStatusTag) => {
      return (
        singleStatusTag.statusBeforeCancellation ===
        fulfillment.status_before_cancellation
      );
    });
    if (!result) {
      result = listStatusTagWithReturned.find((singleStatusTag) => {
        return singleStatusTag.isDefault;
      });
    }
    return result;
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
      case FulFillmentStatus.CANCELLED:
        if (fulfillment?.return_status === FulFillmentReturnStatus.RETURNED) {
          statusTag = findStatusTagWithReturnedOrCancel();
        } else if (
          fulfillment?.return_status === FulFillmentReturnStatus.RETURNING
        ) {
          statusTag = findStatusTagWithReturning();
        }
        break;
      case FulFillmentStatus.RETURNED:
        statusTag = findStatusTagWithReturnedOrCancel();
        break;
      case FulFillmentStatus.RETURNING:
        statusTag = findStatusTagWithReturning();
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
