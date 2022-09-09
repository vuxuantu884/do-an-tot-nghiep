import { Button, Dropdown, Form, FormInstance, Menu } from "antd";
import iconDelete from "assets/icon/deleteIcon.svg";
import iconEdit from "assets/icon/edit.svg";
import threeDot from "assets/icon/three-dot.svg";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import {
  DailyRevenueDetailModel,
  DailyRevenueOtherPaymentModel,
  DailyRevenueOtherPaymentParamsModel,
  DailyRevenueOtherPaymentTypeArrModel,
  DaiLyRevenuePermissionModel,
  DailyRevenueVisibleCardElementModel,
} from "model/order/daily-revenue.model";
import React, { useEffect, useMemo, useState } from "react";
import DailyRevenueCard from "screens/DailyRevenue/components/DailyRevenueCard";
import { formatCurrency } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import DailyRevenueCardAddItem from "../DailyRevenueCardAddItem";
import costIcon from "./../../images/costIcon.svg";
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

type PropTypes = {
  cardType: ShopCostOrSurchargeModel;
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

function ShopCostAndSurchargeCard(props: PropTypes) {
  const {
    cardType,
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
  };

  const [initialValues, setInitialValues] =
    useState<DailyRevenueOtherPaymentParamsModel>(defaultValue);

  const [isVisibleDeleteConfirmModal, setIsVisibleDeleteConfirmModal] = useState(false);
  const [addOrEditType, setAddOrEditType] = useState<AddOrEditModel>(AddOrEditModel.add);
  const [selectedItem, setSelectedItem] = useState<DailyRevenueOtherPaymentModel>();

  const dateFormat = DATE_FORMAT.DD_MM_YY_HHmm;

  const defaultColumn: Array<ICustomTableColumType<DailyRevenueOtherPaymentModel>> = useMemo(() => {
    return [
      {
        title: <span className="noWrap">STT</span>,
        dataIndex: "stt",
        align: "center",
        render: (value: any, row: any, index: number) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: cardType === ShopCostOrSurchargeModel.cost ? "Tên chi phí" : "Tên phụ thu",
        dataIndex: "name",
        key: "name",
        visible: true,
        align: "left",
      },
      {
        title: "Số tiền",
        dataIndex: cardType === ShopCostOrSurchargeModel.cost ? "cost" : "payment",
        key: cardType === ShopCostOrSurchargeModel.cost ? "cost" : "payment",
        visible: true,
        align: "right",
        render: (value: number) => {
          return <span className="noWrap">{formatCurrency(value)}</span>;
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
        align: "left",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value, dateFormat)}</div>,
      },
      {
        title: "Thời gian cập nhật",
        dataIndex: "updated_at",
        key: "updated_at",
        visible: true,
        align: "left",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value, dateFormat)}</div>,
      },
    ];
  }, [cardType, dailyRevenueOtherPaymentTypes, dateFormat]);

  const [isVisibleAdd, setIsVisibleAdd] = useState(false);

  const [columns, setColumns] = useState(defaultColumn);

  const items: DailyRevenueOtherPaymentModel[] =
    dailyRevenueDetail && dailyRevenueDetail.other_payments
      ? dailyRevenueDetail.other_payments.filter((single) => {
          if (cardType === ShopCostOrSurchargeModel.cost) {
            return single.cost > 0;
          } else {
            return single.payment > 0;
          }
        })
      : [];

  const totalAmount =
    cardType === ShopCostOrSurchargeModel.cost
      ? dailyRevenueDetail?.other_cost || 0
      : dailyRevenueDetail?.other_payment || 0;

  const shopRevenueCardBottomLeft = (
    <span>
      Tổng {cardType === ShopCostOrSurchargeModel.cost ? "chi phí" : "phụ thu"}:{" "}
      <strong>{formatCurrency(totalAmount)}</strong>
    </span>
  );

  const renderCardBottomRightButtonText = () => {
    if (
      visibleCardElement.shopCostCard.addButton &&
      cardType === ShopCostOrSurchargeModel.cost &&
      permissions.allowDailyPaymentsUpdateCost
    ) {
      return "Thêm chi phí";
    }
    if (
      visibleCardElement.shopSurchargeCard.addButton &&
      cardType === ShopCostOrSurchargeModel.surcharge &&
      permissions.allowDailyPaymentsUpdatePayment
    ) {
      return "Thêm phụ thu";
    }
  };

  const hideOrShowButtonAdd = (show: boolean) => {
    setVisibleCardElement({
      ...visibleCardElement,
      shopCostCard: {
        ...visibleCardElement.shopCostCard,
        addButton:
          cardType === ShopCostOrSurchargeModel.cost
            ? show
            : visibleCardElement.shopCostCard.addButton,
      },
      shopSurchargeCard: {
        ...visibleCardElement.shopCostCard,
        addButton:
          cardType === ShopCostOrSurchargeModel.surcharge
            ? show
            : visibleCardElement.shopSurchargeCard.addButton,
      },
    });
  };

  useEffect(() => {
    if (items.length > 0) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cardType,
    defaultColumn,
    // hideOrShowButtonAdd,
    items.length,
    visibleCardElement.shopCostCard.actionButton,
    visibleCardElement.shopSurchargeCard.actionButton,
  ]);

  return (
    <StyledComponent>
      <DailyRevenueCard
        title={cardType === ShopCostOrSurchargeModel.cost ? "Chi phí" : "Phụ thu"}
        cardBottomLeft={shopRevenueCardBottomLeft}
        iconUrl={cardType === ShopCostOrSurchargeModel.cost ? costIcon : surchargeIcon}
        cardBottomRightButtonText={renderCardBottomRightButtonText()}
        // handleCardBottomRightButtonClick={handleCreateDailyRevenueShopCost}
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
            emptyText: `Chưa có ${
              cardType === ShopCostOrSurchargeModel.cost ? "chi phí" : "phụ thu"
            }`,
          }}
          className={`dailyRevenueTable ${items.length === 0 && isVisibleAdd ? "hide" : ""}`}
        />
        <DailyRevenueCardAddItem
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
          cardType={cardType}
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
          subTitle={
            <span>
              Bạn có chắc muốn xóa{" "}
              {cardType === ShopCostOrSurchargeModel.cost ? "chi phí" : "phụ thu"} "
              {selectedItem?.name}" này
            </span>
          }
        />
      </DailyRevenueCard>
    </StyledComponent>
  );
}

export default ShopCostAndSurchargeCard;
