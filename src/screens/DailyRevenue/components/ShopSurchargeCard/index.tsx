import { Button, Dropdown, Form, FormInstance, Menu } from "antd";
import iconDelete from "assets/icon/deleteIcon.svg";
import iconEdit from "assets/icon/edit.svg";
import threeDot from "assets/icon/three-dot.svg";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import {
  DaiLyRevenuePermissionModel,
  DailyRevenueDetailModel,
  DailyRevenueOtherPaymentModel,
  DailyRevenueOtherPaymentParamsModel,
  DailyRevenueOtherPaymentTypeArrModel,
  DailyRevenueVisibleCardElementModel,
} from "model/order/daily-revenue.model";
import React, { useCallback, useEffect, useState } from "react";
import DailyRevenueCard from "screens/DailyRevenue/components/DailyRevenueCard";
import { DailyRevenuePaymentMethods } from "screens/DailyRevenue/helper";
import { formatCurrency } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { getArrayFromObject } from "utils/OrderUtils";
import DailyRevenueCardAddSurgeItem from "../DailyRevenueCardAddSurgeItem";
import surchargeIcon from "./../../images/surchargeIcon.svg";
import { StyledComponent } from "./styles";

enum AddOrEditModel {
  add = "add",
  edit = "edit",
}

export enum ShopCostOrSurchargeModel {
  cost = "cost",
  surcharge = "surcharge",
}

type Props = {
  dailyRevenueDetail: DailyRevenueDetailModel | undefined;
  handleAddOtherPaymentItem: (
    values: DailyRevenueOtherPaymentParamsModel,
    form: FormInstance<any>,
  ) => void;
  handleEditOtherPaymentItem: (
    otherPaymentId: number,
    values: DailyRevenueOtherPaymentParamsModel,
    form: FormInstance<any>,
  ) => void;
  handleDeleteOtherPaymentItem: (otherPaymentId: number, form: FormInstance<any>) => void;
  visibleCardElement: DailyRevenueVisibleCardElementModel;
  setVisibleCardElement: (value: DailyRevenueVisibleCardElementModel) => void;
  dailyRevenueOtherPaymentTypes: DailyRevenueOtherPaymentTypeArrModel | undefined;
  isShowActionButton: boolean;
  permissions: DaiLyRevenuePermissionModel;
};

function ShopSurchargeCard(props: Props) {
  const {
    dailyRevenueDetail,
    handleAddOtherPaymentItem,
    handleEditOtherPaymentItem,
    handleDeleteOtherPaymentItem,
    visibleCardElement,
    dailyRevenueOtherPaymentTypes,
    setVisibleCardElement,
    isShowActionButton,
    permissions,
  } = props;
  const [form] = Form.useForm();

  const defaultValue: DailyRevenueOtherPaymentParamsModel = {
    name: undefined,
    payment: undefined,
    cost: undefined,
    description: undefined,
    type: undefined,
    method: undefined,
  };

  const [initialValues, setInitialValues] =
    useState<DailyRevenueOtherPaymentParamsModel>(defaultValue);

  const [isVisibleDeleteConfirmModal, setIsVisibleDeleteConfirmModal] = useState(false);
  const [addOrEditType, setAddOrEditType] = useState<AddOrEditModel>(AddOrEditModel.add);
  const [selectedItem, setSelectedItem] = useState<DailyRevenueOtherPaymentModel>();

  const dateFormat = DATE_FORMAT.DD_MM_YY_HHmm;

  const DailyRevenuePaymentMethodsArr = getArrayFromObject(DailyRevenuePaymentMethods);

  const [isVisibleAdd, setIsVisibleAdd] = useState(false);

  const [columns, setColumns] = useState<ICustomTableColumType<DailyRevenueOtherPaymentModel>[]>(
    [],
  );

  const items: DailyRevenueOtherPaymentModel[] =
    dailyRevenueDetail && dailyRevenueDetail.other_payments
      ? dailyRevenueDetail.other_payments.filter((single) => {
          return single.payment > 0;
        })
      : [];

  const totalAmount = dailyRevenueDetail?.other_payment || 0;

  const shopRevenueCardBottomLeft = (
    <span>
      Tổng phụ thu: <strong>{formatCurrency(totalAmount)}</strong>
    </span>
  );

  const renderCardBottomRightButtonText = () => {
    if (
      visibleCardElement.shopSurchargeCard.addButton &&
      permissions.allowDailyPaymentsUpdatePayment
    ) {
      return "Thêm phụ thu";
    }
  };

  const hideOrShowButtonAdd = useCallback(
    (show: boolean) => {
      setVisibleCardElement({
        ...visibleCardElement,
        shopSurchargeCard: {
          ...visibleCardElement.shopCostCard,
          addButton: show,
        },
      });
    },
    [setVisibleCardElement, visibleCardElement],
  );

  useEffect(() => {
    const defaultColumn: Array<ICustomTableColumType<DailyRevenueOtherPaymentModel>> = [
      {
        title: <span className="noWrap">STT</span>,
        dataIndex: "stt",
        align: "center",
        render: (value: any, row: any, index: number) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: "Tên phụ thu",
        dataIndex: "name",
        key: "name",
        visible: true,
        align: "left",
      },
      {
        title: "Số tiền",
        dataIndex: "payment",
        key: "payment",
        visible: true,
        align: "right",
        render: (value: number, row: any) => {
          return (
            <React.Fragment>
              <span className="noWrap">{formatCurrency(value)}</span>
              <span className="icon">
                <img
                  src={
                    DailyRevenuePaymentMethodsArr.find((single) => single.value === row.method)
                      ?.iconUrl
                  }
                  alt=""
                  className="icon"
                  title={
                    DailyRevenuePaymentMethodsArr.find((single) => single.value === row.method)
                      ?.title
                  }
                />
              </span>
            </React.Fragment>
          );
        },
      },
      {
        title: "Loại",
        dataIndex: "type",
        key: "type",
        visible: true,
        align: "left",
        render: (value: string) => {
          return (
            dailyRevenueOtherPaymentTypes?.find((single) => single.value === value)?.title || value
          );
        },
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        visible: true,
        align: "left",
      },
      {
        title: "Thời gian tạo",
        dataIndex: "created_at",
        key: "created_at",
        visible: true,
        align: "center",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value, dateFormat)}</div>,
      },
      {
        title: "Thời gian cập nhật",
        dataIndex: "updated_at",
        key: "updated_at",
        visible: true,
        align: "center",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value, dateFormat)}</div>,
      },
    ];
    if (isShowActionButton) {
      setColumns([
        ...defaultColumn,
        {
          title: "",
          align: "center",
          render: (value: DailyRevenueOtherPaymentModel) => {
            const menu = (
              <Menu>
                <Menu.Item key="1">
                  <StyledComponent>
                    <Button
                      icon={<img alt="" style={{ marginRight: 12 }} src={iconEdit} />}
                      type="text"
                      className="menuButton"
                      onClick={(e) => {
                        setIsVisibleAdd(true);
                        hideOrShowButtonAdd(false);
                        setAddOrEditType(AddOrEditModel.edit);
                        console.log("value", value);
                        setInitialValues({
                          name: value.name,
                          payment: value.payment,
                          cost: value.cost,
                          description: value.description,
                          type: value.type,
                          method: value.method,
                        });
                        setSelectedItem(value);
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  </StyledComponent>
                </Menu.Item>
                <Menu.Item key="2">
                  <StyledComponent>
                    <Button
                      icon={<img alt="" style={{ marginRight: 12 }} src={iconDelete} />}
                      type="text"
                      className="menuButton deleteButton"
                      onClick={(e) => {
                        setSelectedItem(value);
                        setIsVisibleDeleteConfirmModal(true);
                        // handleDeleteShippingService(row.id);
                      }}
                    >
                      Xóa
                    </Button>
                  </StyledComponent>
                </Menu.Item>
              </Menu>
            );
            return (
              <div className="action-group">
                <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                  <Button
                    type="text"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="actionButton"
                  >
                    <img src={threeDot} alt="" />
                  </Button>
                </Dropdown>
              </div>
            );
          },
        },
      ]);
    } else {
      setColumns([...defaultColumn]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // DailyRevenuePaymentMethodsArr,
    dailyRevenueOtherPaymentTypes,
    dateFormat,
    hideOrShowButtonAdd,
    isShowActionButton,
  ]);

  return (
    <StyledComponent>
      <DailyRevenueCard
        title={"Phụ thu"}
        cardBottomLeft={shopRevenueCardBottomLeft}
        iconUrl={surchargeIcon}
        cardBottomRightButtonText={renderCardBottomRightButtonText()}
        handleCardBottomRightButtonClick={() => {
          setAddOrEditType(AddOrEditModel.add);
          setIsVisibleAdd(true);
          hideOrShowButtonAdd(false);
          setInitialValues(defaultValue);
        }}
      >
        <CustomTable
          showColumnSetting={true}
          dataSource={items}
          columns={columns}
          rowSelectionWidth={30}
          pagination={false}
          rowKey={(item) => item.id.toString()}
          locale={{
            emptyText: `Chưa có phụ thu`,
          }}
          className={`dailyRevenueTable ${items.length === 0 && isVisibleAdd ? "hide" : ""}`}
        />
        <DailyRevenueCardAddSurgeItem
          isVisible={isVisibleAdd}
          handleOkForm={(values, form) => {
            setIsVisibleAdd(false);
            hideOrShowButtonAdd(true);
            if (addOrEditType === AddOrEditModel.add) {
              handleAddOtherPaymentItem(values, form);
            } else {
              if (selectedItem?.id) {
                handleEditOtherPaymentItem(selectedItem.id, values, form);
              }
            }
          }}
          handleCancelForm={() => {
            setIsVisibleAdd(false);
            hideOrShowButtonAdd(true);
          }}
          initialValues={initialValues}
          form={form}
          dailyRevenueOtherPaymentTypes={dailyRevenueOtherPaymentTypes}
        />
        <ModalDeleteConfirm
          visible={isVisibleDeleteConfirmModal}
          onOk={() => {
            if (selectedItem) {
              handleDeleteOtherPaymentItem(selectedItem.id, form);
            }
            setIsVisibleDeleteConfirmModal(false);
          }}
          onCancel={() => setIsVisibleDeleteConfirmModal(false)}
          title="Xác nhận"
          subTitle={<span>Bạn có chắc muốn xóa phụ thu "{selectedItem?.name}" này</span>}
        />
      </DailyRevenueCard>
    </StyledComponent>
  );
}

export default ShopSurchargeCard;
