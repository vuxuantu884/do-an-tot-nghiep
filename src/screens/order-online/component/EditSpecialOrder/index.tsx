import { EditOutlined } from "@ant-design/icons";
import { Form, Popover } from "antd";
import { specialOrderTypes } from "component/order/special-order/SideBarOrderSpecial/helper";
import SpecialOrderCreateForm from "component/order/special-order/SpecialOrderCreateForm";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { OrderPageTypeModel } from "model/order/order.model";
import {
  SpecialOrderFormValueModel,
  SpecialOrderModel,
  SpecialOrderResponseModel,
} from "model/order/special-order.model";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { specialOrderServices } from "service/order/special-order.service";
import { formatCurrency, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { getArrayFromObject } from "utils/OrderUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  title?: string;
  specialOrder?: SpecialOrderResponseModel | null;
  orderId: number;
  onEditSpecialOrderSuccess: (orderID: any, specialOrder?: SpecialOrderResponseModel) => void;
};

function EditSpecialOrder(props: PropTypes) {
  const { title, specialOrder, onEditSpecialOrderSuccess, orderId } = props;
  console.log("specialOrder", specialOrder);

  const dispatch = useDispatch();

  const [displayOrderSpecialType, setDisplayOrderSpecialType] = useState<string | undefined>(
    specialOrder?.type || undefined,
  );

  const [variantSkus, setVariantSkus] = useState<string[]>([]);

  const initialFormValue: SpecialOrderFormValueModel = {
    type: specialOrder?.type || undefined,
    order_original_code: specialOrder?.order_original_code || undefined,
    order_carer_code: specialOrder?.order_carer_code || undefined,
    skus: variantSkus.length > 0 ? variantSkus : undefined,
    amount: specialOrder?.amount || undefined,
    order_return_code: specialOrder?.order_return_code || undefined,
    reason: specialOrder?.reason || undefined,
  };

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (visible: boolean) => {
    console.log("visible", visible);
    setVisible(() => {
      if (visible) {
        setDisplayOrderSpecialType(initialFormValue.type);
        form.resetFields();
      }
      return visible;
    });
  };

  const handleDeleteSpecialOrder = () => {
    dispatch(showLoading());
    specialOrderServices
      .delete(orderId)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa loại đơn hàng thành công");
          onEditSpecialOrderSuccess(orderId, undefined);
        } else {
          handleFetchApiError(response, "Xóa loại đơn hàng", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleSubmitSpecialOrderForm = (value: SpecialOrderModel): Promise<void> => {
    return new Promise((resolve, reject) => {
      specialOrderServices
        .createOrUpdate(orderId, value)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            resolve();
            showSuccess("Cập nhật loại đơn hàng thành công");
            onEditSpecialOrderSuccess(orderId, response.data.special_order);
            setVisible(false);
          } else {
            handleFetchApiError(response, "Cập nhật loại đơn hàng", dispatch);
            reject();
          }
        })
        .catch((error) => {
          reject();
        });
    });
  };

  const specialOrderTypesArr = getArrayFromObject(specialOrderTypes);

  const orderSpecialType = specialOrderTypesArr.find((single) => {
    if (specialOrder?.type) {
      return single.value === specialOrder?.type;
    }
    return false;
  });

  console.log("orderSpecialType", orderSpecialType);
  console.log("initialFormValue", initialFormValue);

  const renderVariants = () => {
    if (!specialOrder?.variant_skus) {
      return null;
    }

    return variantSkus.map((variantSku, index) => {
      return (
        <React.Fragment>
          {variantSku}
          {index + 1 < variantSkus.length && ", "}
        </React.Fragment>
      );
    });
  };

  const ordersSpecialDetail = [
    {
      title: "Loại",
      content: specialOrderTypesArr.find((type) => type.value === specialOrder?.type)?.title,
    },
    {
      title: "Nhân viên CSĐH",
      content: specialOrder?.order_carer_code
        ? `${specialOrder?.order_carer_code} (${specialOrder?.order_carer_name})`
        : null,
    },
    {
      title: "Đơn gốc",
      content: specialOrder?.order_original_code ? (
        <Link to={`${UrlConfig.ORDER}/${specialOrder?.order_original_code}`}>
          {specialOrder?.order_original_code}
        </Link>
      ) : null,
    },
    {
      title: "Sản phẩm",
      content: renderVariants(),
    },
    {
      title: "Đơn trả",
      content: specialOrder?.order_return_code ? (
        <Link to={`${UrlConfig.ORDERS_RETURN}/${specialOrder?.order_return_code}`}>
          {specialOrder?.order_return_code}
        </Link>
      ) : null,
    },

    {
      title: "Số tiền",
      content: specialOrder?.amount && formatCurrency(specialOrder?.amount),
    },
    {
      title: "Lý do",
      content: specialOrder?.reason,
    },
  ];

  useEffect(() => {
    setDisplayOrderSpecialType(initialFormValue.type);
  }, [initialFormValue.type]);

  useEffect(() => {
    let variantSkus = specialOrder?.variant_skus?.split(",");
    if (variantSkus && variantSkus?.length > 0) {
      setVariantSkus(variantSkus);
    } else {
      setVariantSkus([]);
    }
  }, [specialOrder?.variant_skus]);

  return (
    <StyledComponent>
      <div className="wrapper">
        <Popover
          content={
            <StyledComponent>
              <SpecialOrderCreateForm
                exceptOrderTypeSelectArr={[]}
                initialFormValue={initialFormValue}
                handleCancel={() => {
                  setVisible(false);
                }}
                form={form}
                displayOrderSpecialType={displayOrderSpecialType}
                setDisplayOrderSpecialType={setDisplayOrderSpecialType}
                handleSubmitForm={handleSubmitSpecialOrderForm}
                handleDelete={handleDeleteSpecialOrder}
                canDelete={specialOrder ? true : false}
                orderPageType={OrderPageTypeModel.orderCreate}
              />
            </StyledComponent>
          }
          title="Loại đơn hàng"
          trigger="click"
          visible={visible}
          onVisibleChange={handleVisibleChange}
          placement="bottomLeft"
          overlayInnerStyle={{ width: 300 }}
        >
          <EditOutlined className="iconEdit" title="Loại đơn hàng" />
        </Popover>
        {title && <strong>{title}</strong>}
      </div>
      {ordersSpecialDetail && (
        <div className="ordersSpecialDetail">
          {ordersSpecialDetail.map((single, index) => {
            return single.content ? (
              <div key={index}>
                {single.title && <label>{single.title}: </label>}
                <span>{single.content}</span>
              </div>
            ) : null;
          })}
        </div>
      )}
    </StyledComponent>
  );
}

export default EditSpecialOrder;
