import { Button, Col, Form, FormInstance, Input, Row, Tag } from "antd";

import { MenuAction } from "component/table/ActionButton";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { FilterOutlined } from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import { OrderSearchQuery } from "model/order/order.model";
import moment from "moment";
import BaseFilter from "component/filter/base.filter";
import { InventoryTransferLogSearchQuery } from "model/inventory/transfer";
import { BaseFilterWrapper, InventoryFiltersWrapper } from "./styles";
import ButtonSetting from "component/table/ButtonSetting";
import "assets/css/custom-filter.scss";
import { AppConfig } from "config/app.config";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";
import TreeStore from "component/CustomTreeSelect";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { PageResponse } from "model/base/base-metadata.response";

const ACTIONS_STATUS_ARRAY = [
  // {
  //   value: "requested",
  //   name: "Tạo phiếu yêu cầu",
  // },
  {
    value: "confirmed",
    name: "Xác nhận phiếu chuyển",
  },
  {
    value: "exported",
    name: "Xuất hàng khỏi kho",
  },
  {
    value: "pending",
    name: "Chờ xử lý",
  },
  {
    value: "balanced",
    name: "Nhận lại tồn chênh lệch",
  },
  {
    value: "received",
    name: "Nhận hàng",
  },
  {
    value: "deleted",
    name: "Xóa phiếu",
  },
  {
    value: "updated",
    name: "Cập nhật phiếu",
  },
  {
    value: "canceled",
    name: "Hủy phiếu",
  },
  {
    value: "forward",
    name: "Chuyển tiếp kho",
  },
  {
    value: "from_store_changed",
    name: "Thay đổi kho gửi",
  },
  {
    value: "to_store_changed",
    name: "Thay đổi kho nhận",
  },
  {
    value: "line_item_added",
    name: "Thêm dòng sản phẩm",
  },
  {
    value: "line_item_removed",
    name: "Xóa dòng sản phẩm",
  },
  {
    value: "line_item_updated",
    name: "Cập nhật dòng sản phẩm",
  },
  {
    value: "general_updated",
    name: "Cập nhật",
  }
];

type InventoryFilterProps = {
  params: InventoryTransferLogSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: Boolean;
  accounts: Array<AccountResponse> | undefined;
  defaultAccountProps?: PageResponse<AccountResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  stores?: Array<StoreResponse>;
};

const { Item } = Form;

const InventoryListLogFilters: React.FC<InventoryFilterProps> = (props: InventoryFilterProps) => {
  const {
    params,
    actions,
    isLoading,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
    stores,
    accounts,
    defaultAccountProps,
  } = props;
  const [formAdv] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();
  const inputSearchRef = useRef<Input | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterFromParams = {
    ...params,
    action: Array.isArray(params.action) ? params.action : [params.action],
    updated_by: Array.isArray(params.updated_by) ? params.updated_by : [params.updated_by],
    from_created_date: formatDateFilter(params.from_created_date),
    to_created_date: formatDateFilter(params.to_created_date),
  };
  const initialValues = useMemo(() => {
    return filterFromParams;
  }, [filterFromParams]);

  useEffect(() => {
    formSearchRef.current?.setFieldsValue({
      ...params,
      from_store_id: params.from_store_id
        ? Array.isArray(params.from_store_id)
          ? params.from_store_id.map((storeId) => Number(storeId))
          : [Number(params.from_store_id)]
        : [],
      to_store_id: params.to_store_id
        ? Array.isArray(params.to_store_id)
          ? params.to_store_id.map((storeId) => Number(storeId))
          : [Number(params.to_store_id)]
        : [],
    });
  }, [formSearchRef, params]);

  useEffect(() => {
    if (
      filterFromParams.action &&
      filterFromParams.action.length === 2 &&
      filterFromParams.action[0] === "DELETE" &&
      filterFromParams.action[1] === "CANCEL_SHIPMENT"
    ) {
      // @ts-ignore
      filterFromParams.action = ["DELETE,CANCEL_SHIPMENT"];
    }
    formAdv.setFieldsValue(filterFromParams);
  }, [filterFromParams, formAdv, formSearchRef, params]);

  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState("");

  const loadingFilter = useMemo(() => {
    return !!isLoading;
  }, [isLoading]);

  const onClearFilterClick = useCallback(() => {
    onClearFilter && onClearFilter();

    setVisible(false);
  }, [onClearFilter]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();

      switch (tag.key) {
        case "action":
          onFilter && onFilter({ ...params, action: [] });
          break;
        case "updated_by":
          onFilter && onFilter({ ...params, updated_by: [] });
          break;
        case "created_date":
          formAdv.resetFields(["from_created_date", "to_created_date"]);
          onFilter &&
            onFilter({
              ...params,
              from_created_date: null,
              to_created_date: null,
            });
          break;
        default:
          break;
      }
    },
    [formAdv, onFilter, params],
  );

  const onFinish = useCallback(
    (values) => {
      const valuesForm = {
        ...values,
        condition: values.condition ? values.condition.trim() : null,
      };
      onFilter && onFilter(valuesForm);
    },
    [onFilter],
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    let values = formAdv.getFieldsValue(true);

    if (values?.from_total_variant > values?.to_total_variant) {
      values = {
        ...values,
        from_total_variant: values?.to_total_variant,
        to_total_variant: values?.from_total_variant,
      };
    }
    if (values?.from_total_quantity > values?.to_total_quantity) {
      values = {
        ...values,
        from_total_quantity: values?.to_total_quantity,
        to_total_quantity: values?.from_total_quantity,
      };
    }
    if (values?.from_total_amount > values?.to_total_amount) {
      values = {
        ...values,
        from_total_amount: values?.to_total_amount,
        to_total_amount: values?.from_total_amount,
      };
    }
    const valuesForm = {
      ...values,
      condition: values.condition ? values.condition.trim() : null,
      from_created_date: formAdv.getFieldValue("from_created_date")
        ? getStartOfDayCommon(formAdv.getFieldValue("from_created_date"))?.format()
        : null,
      to_created_date: formAdv.getFieldValue("to_created_date")
        ? getEndOfDayCommon(formAdv.getFieldValue("to_created_date"))?.format()
        : null,
    };
    onFilter && onFilter(valuesForm);
  }, [formAdv, onFilter]);

  let filters = useMemo(() => {
    let list = [];
    if (initialValues.action.length) {
      let textAction = "";

      if (initialValues.action.length > 1) {
        // @ts-ignore
        if (initialValues.action.indexOf("DELETE") !== -1) {
          initialValues.action = initialValues.action.filter(
            (item) => item !== "DELETE" && item !== "CANCEL_SHIPMENT",
          );
          // @ts-ignore
          initialValues.action.push("DELETE,CANCEL_SHIPMENT");
        }

        initialValues.action.forEach((actionValue) => {
          const status = ACTIONS_STATUS_ARRAY?.find((status) => status.value === actionValue);
          textAction = status ? textAction + status.name + "; " : textAction;
        });
      } else if (initialValues.action.length === 1) {
        initialValues.action.forEach((actionValue) => {
          const status = ACTIONS_STATUS_ARRAY?.find((status) => status.value === actionValue);
          textAction = status ? textAction + status.name : textAction;
        });
      }

      list.push({
        key: "action",
        name: "Trạng thái",
        value: textAction,
      });
    }
    if (initialValues.updated_by.length) {
      let textAccount = "";

      if (initialValues.updated_by.length > 1) {
        initialValues.updated_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code + "; "
            : textAccount;
        });
      } else if (initialValues.updated_by.length === 1) {
        initialValues.updated_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code + "; "
            : textAccount;
        });
      }

      list.push({
        key: "updated_by",
        name: "Người sửa",
        value: textAccount,
      });
    }
    if (initialValues.from_created_date || initialValues.to_created_date) {
      let textCreatedDate =
        (initialValues.from_created_date
          ? moment(initialValues.from_created_date).format("DD-MM-YYYY")
          : "??") +
        " ~ " +
        (initialValues.to_created_date
          ? moment(initialValues.to_created_date).format("DD-MM-YYYY")
          : "??");
      list.push({
        key: "created_date",
        name: "Ngày tạo",
        value: textCreatedDate,
      });
    }

    return list;
  }, [initialValues, accounts]);

  useEffect(() => {
    if (!inputSearchRef) return;
    inputSearchRef?.current?.focus();
  }, [inputSearchRef]);

  return (
    <InventoryFiltersWrapper>
      <div className="custom-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions} actionDisable>
          <Form
            onFinish={onFinish}
            ref={formSearchRef}
            initialValues={initialValues}
            layout="inline"
          >
            <Item name="from_store_id" className="select-item">
              <TreeStore
                placeholder="Kho gửi"
                storeByDepartmentList={stores as unknown as StoreByDepartment[]}
                style={{ width: 300 }}
              />
            </Item>
            <Item name="to_store_id" className="select-item">
              <TreeStore
                placeholder="Kho nhận"
                storeByDepartmentList={stores as unknown as StoreByDepartment[]}
                style={{ width: 300 }}
              />
            </Item>
            <Item name="condition" className="input-search">
              <Input
                ref={inputSearchRef}
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã phiếu"
                onBlur={(e) => {
                  formSearchRef?.current?.setFieldsValue({
                    condition: e.target.value.trim(),
                  });
                }}
              />
            </Item>
            <Item>
              <Button
                style={{ width: "80px" }}
                type="primary"
                disabled={loadingFilter}
                loading={loadingFilter}
                htmlType="submit"
              >
                Lọc
              </Button>
            </Item>
            <Item>
              <Button style={{ width: "180px" }} icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
              </Button>
            </Item>
            <ButtonSetting onClick={onShowColumnSetting} />
          </Form>
        </CustomFilter>
      </div>
      <BaseFilter
        onClearFilter={onClearFilterClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        className="order-filter-drawer"
        width={500}
      >
        {visible && (
          <Form
            ref={formRef}
            form={formAdv}
            // initialValues={initialValues}
            layout="vertical"
          >
            <BaseFilterWrapper>
              <Row gutter={12} style={{ marginTop: "10px" }}>
                <Col span={12}>
                  <Item label="Người sửa" name="updated_by">
                    <AccountSearchPaging
                      defaultAccountProps={defaultAccountProps}
                      mode="tags"
                      placeholder="Chọn người sửa"
                      fixedQuery={{
                        account_id: [AppConfig.WIN_DEPARTMENT],
                        status: "active",
                      }}
                    />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item label="Thao tác" name="action">
                    <CustomSelect
                      mode="multiple"
                      style={{ width: "100%" }}
                      showArrow
                      maxTagCount={"responsive"}
                      placeholder="Chọn thao tác"
                      notFoundContent="Không tìm thấy kết quả"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      {ACTIONS_STATUS_ARRAY.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.value}
                        >
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
              </Row>
              <Row gutter={12} style={{ marginTop: "10px" }}>
                <Col span={24}>
                  <div className="label-date">Ngày tạo</div>
                  <CustomFilterDatePicker
                    fieldNameFrom="from_created_date"
                    fieldNameTo="to_created_date"
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />
                </Col>
              </Row>
            </BaseFilterWrapper>
          </Form>
        )}
      </BaseFilter>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index) => {
            return (
              <Tag
                key={index}
                className="tag mb-20"
                closable
                onClose={(e) => onCloseTag(e, filter)}
              >
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </InventoryFiltersWrapper>
  );
};

export default InventoryListLogFilters;
