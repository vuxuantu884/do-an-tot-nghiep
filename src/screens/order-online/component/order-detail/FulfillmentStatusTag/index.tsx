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

  const tagStyles = {
    cancel: {
      color: "#E24343",
      backgroundColor: "rgba(226, 67, 67, 0.1)",
    },
    normal: {
      color: "#FCAF17",
      backgroundColor: "rgba(252, 175, 23, 0.1)",
    },
  };

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

  const findStatusTagDefault = () => {
    return listStatusTagWithoutReturn.find((singleStatusTag) => {
      return singleStatusTag.status === fulfillment?.status;
    });
  };

  const getStatusTagWithCancelled = () => {
    let justNotSendTo3PLArr = [
      FulFillmentStatus.UNSHIPPED,
      FulFillmentStatus.PICKED,
      FulFillmentStatus.PACKED,
    ];
    if (
      fulfillment?.status_before_cancellation &&
      justNotSendTo3PLArr.includes(fulfillment.status_before_cancellation)
    ) {
      return {
        name: "Hủy đơn giao",
        status: FulFillmentStatus.CANCELLED,
        color: tagStyles.cancel.color,
        backgroundColor: tagStyles.cancel.backgroundColor,
      };
    }
    if (fulfillment?.return_status === FulFillmentReturnStatus.RETURNED) {
      return {
        name: "Hủy đơn giao - Đã nhận hàng",
        status: FulFillmentStatus.CANCELLED,
        color: tagStyles.cancel.color,
        backgroundColor: tagStyles.cancel.backgroundColor,
      };
    } else {
      return {
        name: "Hủy đơn giao - Chưa nhận hàng",
        status: FulFillmentStatus.CANCELLED,
        color: tagStyles.cancel.color,
        backgroundColor: tagStyles.cancel.backgroundColor,
      };
    }
  };

  const getStatusTagWithShipping = () => {
    if(fulfillment?.return_status === FulFillmentReturnStatus.RETURNING) {
      return {
        name: "Hủy đơn giao - Chưa nhận hàng",
        status: FulFillmentStatus.CANCELLED,
        color: tagStyles.cancel.color,
        backgroundColor: tagStyles.cancel.backgroundColor,
      };
    } else {
      return findStatusTagDefault();
    }
  };

  const getStatusTagWithShipped = () => {
    if(fulfillment?.return_status === FulFillmentReturnStatus.RETURNED) {
      return {
        name: "Hủy đơn giao - Đã nhận hàng",
        status: FulFillmentStatus.CANCELLED,
        color: tagStyles.cancel.color,
        backgroundColor: tagStyles.cancel.backgroundColor,
      };
    } else {
      return findStatusTagDefault();
    }
  };

  const findStatusTag = () => {
    switch (fulfillment?.status) {
      case FulFillmentStatus.CANCELLED:
        return getStatusTagWithCancelled();
      case FulFillmentStatus.SHIPPING:
        return getStatusTagWithShipping();
      case FulFillmentStatus.SHIPPED:
        return getStatusTagWithShipped();
      default:
        return findStatusTagDefault();
    }
  };

  const renderStatusTag = () => {
    if (!fulfillment) {
      return;
    }
    let statusTag = findStatusTag();
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
}

export default FulfillmentStatusTag;
