import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Tag,
  InputNumber,
} from "antd";

import {MenuAction} from "component/table/ActionButton";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import search from "assets/img/search.svg";
import {AccountResponse} from "model/account/account.model";
import {FilterOutlined} from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import {OrderSearchQuery} from "model/order/order.model";
import moment from "moment";
import BaseFilter from "component/filter/base.filter";
import {
  INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY,
  STATUS_INVENTORY_ADJUSTMENT_ARRAY,
} from "../../constants";
import {StoreResponse} from "model/core/store.model";
import "./styles.scss";
import ButtonSetting from "component/table/ButtonSetting";
import { formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import CustomFilterDatePicker from "../../../../../component/custom/filter-date-picker.custom";
import { searchAccountPublicAction } from "../../../../../domain/actions/account/account.action";
import { useDispatch } from "react-redux";
import { PageResponse } from "../../../../../model/base/base-metadata.response";

type InventoryAdjustmentFilterProps = {
  params: any;
  actions: Array<MenuAction>;
  isLoading?: Boolean;
  accounts: Array<AccountResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  setAccounts?: (value: any) => void;
  onClearFilter?: () => void;
  stores?: Array<StoreResponse>;
};

const {Item} = Form;
const {Option} = Select;

const InventoryAdjustmentFilters: React.FC<InventoryAdjustmentFilterProps> = (
  props: InventoryAdjustmentFilterProps
) => {
  const {
    params,
    isLoading,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
    stores,
    accounts,
    setAccounts
  } = props;
  const [dateClick, setDateClick] = useState('');
  const initialValues = useMemo(() => {
    return {
      ...params,
      status: Array.isArray(params.status) ? params.status : [params.status],
      created_name: Array.isArray(params.created_name)
        ? params.created_name
        : [params.created_name],
    };
  }, [params]);

  const [formAvd] = Form.useForm();
  const [form] = Form.useForm();

  const [visible, setVisible] = useState(false);

  const loadingFilter = useMemo(() => {
    return !!isLoading;
  }, [isLoading]);

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const setDataAccount = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) return;
      setAccounts && setAccounts(data.items);
    },
    [setAccounts]
  );

  const dispatch = useDispatch();
  const getCreatedName = useCallback((code: string, page: number) => {
    dispatch(
      searchAccountPublicAction(
        { codes: code, page: page },
        setDataAccount
      )
    );
  }, [dispatch, setDataAccount]);

  useEffect(() => {
    const filter = {
      ...params,
      from_created_date: formatDateFilter(params.from_created_date),
      to_created_date: formatDateFilter(params.to_created_date),
      from_audited_date: formatDateFilter(params.from_audited_date),
      to_audited_date: formatDateFilter(params.to_audited_date),
      from_adjusted_date: formatDateFilter(params.from_adjusted_date),
      to_adjusted_date: formatDateFilter(params.to_adjusted_date),
    };

    if (params.created_name && params.created_name !== '') getCreatedName(params.created_name, 1);

    formAvd.setFieldsValue(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formAvd, params]);

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);

  const onClearFilterClick = useCallback(() => {
    onClearFilter && onClearFilter();
    formSearchRef?.current?.setFieldsValue({
      code: "",
      adjusted_store_id: "",
    });

    setVisible(false);
  }, [formSearchRef, onClearFilter]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "status":
          onFilter && onFilter({...params, status: []});
          break;
        case "audit_type":
          onFilter && onFilter({...params, audit_type: []});
          break;
        case "total_variant":
          onFilter &&
            onFilter({...params, from_total_variant: null, to_total_variant: null});
          break;
        case "total_quantity":
          onFilter &&
            onFilter({...params, from_total_quantity: null, to_total_quantity: null});
          break;
        case "total_amount":
          onFilter &&
            onFilter({...params, from_total_amount: null, to_total_amount: null});
          break;
        case "created_name":
          onFilter && onFilter({...params, created_name: []});
          break;
        case "created_date":
          onFilter &&
            onFilter({...params, from_created_date: null, to_created_date: null});
          break;
        case "audited_date":
          onFilter &&
            onFilter({
              ...params,
              from_audited_date: null,
              to_audited_date: null,
            });
          break;
        case "adjusted_date":
          onFilter &&
            onFilter({
              ...params,
              from_adjusted_date: null,
              to_adjusted_date: null,
            });
          break;

        default:
          break;
      }
    },
    [onFilter, params]
  );

  const onFinish = useCallback(
    (values) => {
      const valuesForm = {
        ...values,
        code: values.code ? values.code.trim() : null,
      };
      onFilter && onFilter(valuesForm);
    },
    [
      onFilter,
    ]
  );

  const onFinishAvd = useCallback(
    (values: any) => {
      formAvd.setFieldsValue(values);
      values.from_created_date = getStartOfDayCommon(values.from_created_date)?.format();
      values.to_created_date = getEndOfDayCommon(values.to_created_date)?.format();
      values.from_adjusted_date = getStartOfDayCommon(values.from_adjusted_date)?.format();
      values.to_adjusted_date = getEndOfDayCommon(values.to_adjusted_date)?.format();
      values.from_audited_date = getStartOfDayCommon(values.from_audited_date)?.format();
      values.to_audited_date = getEndOfDayCommon(values.to_audited_date)?.format();

      onFilter && onFilter(values);
    },
    [formAvd, onFilter]
  );

  const filters = () => {
    let list = [];
    if (initialValues?.status?.length) {
      let textStatus = "";

      if (initialValues.status.length > 1) {

        initialValues.status.forEach((statusValue: any) => {
          const status = STATUS_INVENTORY_ADJUSTMENT_ARRAY?.find(
            (status) => status.value === statusValue
          );
          textStatus = status ? textStatus + status.name + "; " : textStatus;
        });

      } else if (initialValues.status.length === 1) {

        initialValues.status.forEach((statusValue: any) => {
          const status = STATUS_INVENTORY_ADJUSTMENT_ARRAY?.find(
            (status) => status.value === statusValue
          );
          textStatus = status ? textStatus + status.name : textStatus;
        });
      }

      list.push({
        key: "status",
        name: "Trạng thái",
        value: textStatus,
      });
    }
    if (initialValues?.audit_type?.length) {
      let auditTypeName = "";
      let auditTypes = initialValues.audit_type;
      if (!Array.isArray(auditTypes)) {
        auditTypes = [auditTypes]
      }

      if (auditTypes.length > 1) {
        auditTypes.forEach((value: any) => {
          const auditType = INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY?.find(
            (auditType) => auditType.value === value
          );
          auditTypeName = auditType ? auditTypeName + auditType.name + "; " : auditTypeName;
        });

      } else if (auditTypes.length === 1) {

        auditTypes.forEach((value: any) => {
          const auditType = INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY?.find(
            (auditType) => auditType.value === value
          );
          auditTypeName = auditType ? auditTypeName + auditType.name : auditTypeName;
        });
      }

      list.push({
        key: "audit_type",
        name: "Loại kiểm",
        value: auditTypeName,
      });
    }
    if (initialValues.from_total_quantity || initialValues.to_total_quantity) {
      let textTotalQuantity =
        (initialValues.from_total_quantity ? initialValues.from_total_quantity : " ?? ") +
        " ~ " +
        (initialValues.to_total_quantity ? initialValues.to_total_quantity : " ?? ");
      list.push({
        key: "total_quantity",
        name: "Số lượng",
        value: textTotalQuantity,
      });
    }
    if (initialValues.created_name.length) {
      let textAccount = ""
      if (initialValues.created_name.length > 1) {
        initialValues.created_name.forEach((i: any) => {
          const findAccount = accounts?.find(item => item.code === i)
          textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
        })
      } else if (initialValues.created_name.length === 1) {

        initialValues.created_name.forEach((i: any) => {
          const findAccount = accounts?.find(item => item.code === i)
          textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code : textAccount
        })
      }
      list.push({
        key: 'created_name',
        name: 'Người tạo',
        value: textAccount
      })
    }
    if (initialValues.from_created_date || initialValues.to_created_date) {
      let textCreatedDate =
        (initialValues.from_created_date
          ? moment(initialValues.from_created_date).format("DD-MM-YYYY")
          : "??") +
        " ~ " +
        (initialValues.to_created_date
          ? moment(initialValues.to_created_date).utc(false).format("DD-MM-YYYY")
          : "??");
      list.push({
        key: "created_date",
        name: "Ngày tạo",
        value: textCreatedDate,
      });
    }
    if (initialValues.from_audited_date || initialValues.to_audited_date) {
      let textInventoryAuditedDate =
        (initialValues.from_audited_date
          ? moment(initialValues.from_audited_date).format("DD-MM-YYYY")
          : "??") +
        " ~ " +
        (initialValues.to_audited_date
          ? moment(initialValues.to_audited_date).utc(false).format("DD-MM-YYYY")
          : "??");
      list.push({
        key: "audited_date",
        name: "Ngày kiểm",
        value: textInventoryAuditedDate,
      });
    }

    if (initialValues.from_adjusted_date || initialValues.to_adjusted_date) {
      let textInventoryAdjustmentDate =
        (initialValues.from_adjusted_date
          ? moment(initialValues.from_adjusted_date).format("DD-MM-YYYY")
          : "??") +
        " ~ " +
        (initialValues.to_adjusted_date
          ? moment(initialValues.to_adjusted_date).utc(false).format("DD-MM-YYYY")
          : "??");
      list.push({
        key: "adjusted_date",
        name: "Ngày cân bằng",
        value: textInventoryAdjustmentDate,
      });
    }

    return list;
  }

  return (
    <>
      <div className="adjustment-filter">
        <Form
          form={form}
          onFinish={onFinish}
          ref={formSearchRef}
          initialValues={initialValues}
          layout="inline"
        >
          <Item name="adjusted_store_id">
            <CustomSelect
              style={{
                width: 150,
              }}
              allowClear={true}
              placeholder="Chọn kho kiểm"
              showArrow
              showSearch
              optionFilterProp="children"
              onClear={() => formSearchRef?.current?.submit()}
            >
              {Array.isArray(stores) &&
                stores.length > 0 &&
                stores.map((item, index) => (
                  <Option key={"adjusted_store_id" + index} value={item.id.toString()}>
                    {item.name}
                  </Option>
                ))}
            </CustomSelect>
          </Item>
          <Item style={{flex: 1}} name="code" className="input-search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo mã phiếu kiểm"
              onBlur={(e) => {
                formSearchRef?.current?.setFieldsValue({
                  code: e.target.value.trim(),
                });
              }}
            />
          </Item>
          <Item>
            <Button type="primary" loading={loadingFilter} htmlType="submit">
              Lọc
            </Button>
          </Item>
          <Item>
            <Button icon={<FilterOutlined />} onClick={openFilter}>
              Thêm bộ lọc
            </Button>
          </Item>
          <ButtonSetting onClick={onShowColumnSetting} />
        </Form>

        <BaseFilter
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          width={700}
        >
          {visible && (
            <Form
              onFinish={onFinishAvd}
              ref={formRef}
              form={formAvd}
              initialValues={params}
              layout="vertical"
            >
              <>
                <Row gutter={12} style={{marginTop: "10px"}}>
                  <Col span={12}>
                    <div className="font-weight-500">Trạng thái</div>
                    <Item name="status" style={{margin: "10px 0px"}}>
                      <CustomSelect
                        mode="multiple"
                        showArrow
                        placeholder="Chọn trạng thái"
                        notFoundContent="Không tìm thấy kết quả"
                        optionFilterProp="children"
                        style={{width: "100%"}}
                        getPopupContainer={(trigger) => trigger.parentNode}
                      >
                        {STATUS_INVENTORY_ADJUSTMENT_ARRAY.map((item, index) => (
                          <CustomSelect.Option
                            style={{width: "100%"}}
                            key={index.toString()}
                            value={item.value}
                          >
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    </Item>
                  </Col>
                  <Col span={12}>
                    <div className="font-weight-500">Loại kiểm kho</div>
                    <Item name="audit_type" style={{margin: "10px 0px"}}>
                      <CustomSelect
                        mode="multiple"
                        showSearch
                        showArrow
                        maxTagCount="responsive"
                        placeholder="Chọn loại kiểm kho"
                        notFoundContent="Không tìm thấy kết quả"
                        optionFilterProp="children"
                        style={{width: "100%"}}
                        getPopupContainer={(trigger) => trigger.parentNode}
                      >
                        {INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.map((item, index) => {
                          return (
                            <CustomSelect.Option
                              style={{width: "100%"}}
                              key={index.toString()}
                              value={item.value}
                            >
                              {item.name}
                            </CustomSelect.Option>
                          );
                        })}
                      </CustomSelect>
                    </Item>
                  </Col>
                </Row>
                <Row gutter={12} style={{marginTop: "10px"}}>
                  <Col span={12}>
                    <div className="font-weight-500 mb-10">Người tạo</div>
                    <Item name="created_name">
                      <AccountSearchPaging placeholder="Chọn người tạo" mode="multiple"/>
                    </Item>
                  </Col>
                  <Col span={12}>
                    <div className="font-weight-500 mb-10">Ngày tạo</div>
                    <CustomFilterDatePicker
                      fieldNameFrom="from_created_date"
                      fieldNameTo="to_created_date"
                      activeButton={dateClick}
                      setActiveButton={setDateClick}
                      formRef={formRef}
                    />
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={12}>
                    <div className="font-weight-500 mb-10">Ngày kiểm</div>
                    <CustomFilterDatePicker
                      fieldNameFrom="from_audited_date"
                      fieldNameTo="to_audited_date"
                      activeButton={dateClick}
                      setActiveButton={setDateClick}
                      formRef={formRef}
                    />
                  </Col>
                  <Col span={12}>
                    <div className="font-weight-500 mb-10">Ngày cân bằng</div>
                    <Item name="created_name">
                      <CustomFilterDatePicker
                        fieldNameFrom="from_adjusted_date"
                        fieldNameTo="to_adjusted_date"
                        activeButton={dateClick}
                        setActiveButton={setDateClick}
                        formRef={formRef}
                      />
                    </Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={12}>
                    <div className="font-weight-500">Số lượng</div>
                    <Input.Group compact>
                      <Item
                        name="from_total_quantity"
                        style={{textAlign: "center", margin: "10px 0px"}}
                      >
                        <InputNumber
                          className="price_min"
                          placeholder="Từ"
                          min="0"
                          max="100000000"
                        />
                      </Item>

                      <div
                        className="site-input-split"
                      >~</div>
                      <Item
                        name="to_total_quantity"
                        style={{textAlign: "center", margin: "10px 0px"}}
                      >
                        <InputNumber
                          className="site-input-right price_max"
                          placeholder="Đến"
                          min="0"
                          max="1000000000"
                        />
                      </Item>
                    </Input.Group>
                  </Col>
                </Row>
              </>
            </Form>
          )}
        </BaseFilter>
      </div>
      <div className="order-filter-tags">
        {filters() &&
          filters().map((filter: any) => {
            return (
              <Tag style={{ marginBottom: 20 }} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </>
  );
};

export default InventoryAdjustmentFilters;
