import React, { createRef, useEffect, useState, useCallback } from "react";
import { Button, Col, Form, FormInstance, Input, Row, Select, Tag } from "antd";
import search from "assets/img/search.svg";
import ButtonSetting from "component/table/ButtonSetting";
import { AccountResponse, AccountStoreResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { InventoryDefectQuery } from "model/inventory-defects";
import { DefectFilterEnum, DefectFilterTag } from "model/inventory-defects/filter";
import { strForSearch } from "utils/StringUtils";
import "assets/css/custom-filter.scss";
import { FilterOutlined } from "@ant-design/icons";
import BaseFilter from "component/filter/base.filter";
import {
  DATE_FORMAT,
  formatDateFilter,
  getEndOfDayCommon,
  getStartOfDayCommon,
} from "utils/DateUtils";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import moment from "moment";
import { isNullOrUndefined } from "utils/AppUtils";
import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import { DefectHistoryFilterWrapper, FilterDefectHistoryAdvWrapper } from "./styles";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { useDispatch } from "react-redux";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { PageResponse } from "model/base/base-metadata.response";

type DefectHistoryFilterProps = {
  params: InventoryDefectQuery;
  myStores?: Array<AccountStoreResponse>;
  stores: Array<StoreResponse>;
  accounts: Array<AccountResponse>;
  showColumnSetting: () => void;
  filterDefects: (value: InventoryDefectQuery) => void;
  clearFilterDefect: () => void;
  setAccounts: (data: Array<AccountResponse>) => void;
};

const InventoryHistoryDefectFilter: React.FC<DefectHistoryFilterProps> = (
  props: DefectHistoryFilterProps,
) => {
  const {
    params,
    myStores,
    stores,
    showColumnSetting,
    filterDefects,
    clearFilterDefect,
    accounts,
    setAccounts,
  } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [messageErrorDefect, setMessageErrorDefect] = useState("");
  const [dateClick, setDateClick] = useState("");
  const [formBase] = Form.useForm();
  const [formAdv] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const { Item } = Form;
  const { Option } = Select;
  const dispatch = useDispatch();

  const formValues = {
    ...params,
  };

  const setDataAccount = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) return;
      setAccounts && setAccounts(data.items);
    },
    [setAccounts],
  );

  const getCreatedName = useCallback(
    (code: string, page: number) => {
      dispatch(searchAccountPublicAction({ codes: code, page: page }, setDataAccount));
    },
    [dispatch, setDataAccount],
  );

  useEffect(() => {
    const filter = {
      ...params,
      from_date: formatDateFilter(params.from_date),
      to_date: formatDateFilter(params.to_date),
    };
    if (params.updated_by && params.updated_by.length > 0)
      getCreatedName(params.updated_by as string, 1);

    formBase.setFieldsValue({
      [DefectFilterEnum.condition]: filter.condition,
      [DefectFilterEnum.store_ids]: filter.store_ids,
    });
    formAdv.setFieldsValue(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formAdv, formBase, params]);

  const filterBase = (values: InventoryDefectQuery) => {
    // make sure user enter something, not special characters
    if (values.condition && !/[a-zA-Z0-9\s-]{1,}/.test(values.condition)) return;
    const valuesForm = {
      ...values,
      condition: values.condition ? values.condition.trim() : "",
    };
    filterDefects(valuesForm);
  };

  const clearFilterClick = () => {
    formBase.resetFields();
    formAdv.resetFields();
    setMessageErrorDefect("");
    clearFilterDefect();
  };

  const closeTag = (e: React.MouseEvent<HTMLElement>, tag: DefectFilterTag) => {
    e.preventDefault();
    switch (tag.key) {
      case DefectFilterEnum.condition:
        formBase.setFieldsValue({ [DefectFilterEnum.condition]: undefined });
        formAdv.setFieldsValue({ [DefectFilterEnum.condition]: undefined });
        filterDefects({ ...params, [DefectFilterEnum.condition]: "" });
        break;
      case DefectFilterEnum.store_ids:
        formBase.setFieldsValue({ [DefectFilterEnum.store_ids]: undefined });
        formAdv.setFieldsValue({ [DefectFilterEnum.store_ids]: undefined });
        filterDefects({
          ...params,
          [DefectFilterEnum.store_ids]: undefined,
        });
        break;
      case DefectFilterEnum.transaction_date:
        formAdv.setFieldsValue({
          [DefectFilterEnum.from_date]: undefined,
          [DefectFilterEnum.to_date]: undefined,
        });
        filterDefects({
          ...params,
          [DefectFilterEnum.from_date]: undefined,
          [DefectFilterEnum.to_date]: undefined,
        });
        break;
      case DefectFilterEnum.defect_quantity:
        formAdv.setFieldsValue({
          [DefectFilterEnum.from_defect]: undefined,
          [DefectFilterEnum.to_defect]: undefined,
        });
        filterDefects({
          ...params,
          [DefectFilterEnum.from_defect]: undefined,
          [DefectFilterEnum.to_defect]: undefined,
        });
        break;
      case DefectFilterEnum.updated_by:
        formAdv.setFieldsValue({
          [DefectFilterEnum.updated_by]: undefined,
        });
        filterDefects({
          ...params,
          [DefectFilterEnum.updated_by]: undefined,
        });
        break;
      default:
        break;
    }
  };

  const renderTagFilter = () => {
    const listTag: Array<DefectFilterTag> = [];
    if (formValues.condition) {
      listTag.push({
        key: DefectFilterEnum.condition,
        name: "Thông tin tìm kiếm",
        value: formValues.condition,
      });
    }
    if (formValues.store_ids && formValues.store_ids.length > 0) {
      const storeIds = Array.isArray(formValues.store_ids)
        ? formValues.store_ids
        : [formValues.store_ids];
      let textStoreId = "";
      if (storeIds.length === 1) {
        const storeObj = stores.find(
          (el: StoreResponse) => formValues.store_ids && el.id === Number(storeIds[0]),
        );
        textStoreId = storeObj ? storeObj.name + "; " : "";
      } else if (storeIds.length > 1) {
        storeIds.forEach((storeId: string) => {
          const findStore = stores.find((store: StoreResponse) => store.id === Number(storeId));
          textStoreId = findStore ? textStoreId + findStore.name + "; " : "";
        });
      }
      listTag.push({
        key: DefectFilterEnum.store_ids,
        name: "Cửa hàng",
        value: textStoreId,
      });
    }
    if (formValues.from_defect || formValues.to_defect) {
      let textDefect =
        (!isNullOrUndefined(formValues.from_defect) ? formValues.from_defect : "??") +
        " ~ " +
        (!isNullOrUndefined(formValues.to_defect) ? formValues.to_defect : "??");
      listTag.push({
        key: DefectFilterEnum.defect_quantity,
        name: "Số lỗi",
        value: textDefect,
      });
    }
    if (formValues.from_date || formValues.to_date) {
      let textUpdatedDate =
        (formValues.from_date ? moment(formValues.from_date).format(DATE_FORMAT.DDMMYYY) : "??") +
        " ~ " +
        (formValues.to_date
          ? moment(formValues.to_date).utc(false).format(DATE_FORMAT.DDMMYYY)
          : "??");
      listTag.push({
        key: DefectFilterEnum.transaction_date,
        name: "Ngày thao tác",
        value: textUpdatedDate,
      });
    }
    if (formValues.updated_by && formValues.updated_by.length > 0) {
      const updatedByAccounts = Array.isArray(formValues.updated_by)
        ? formValues.updated_by
        : [formValues.updated_by];
      let textUpdatedBy = "";
      if (updatedByAccounts.length > 1) {
        updatedByAccounts.forEach((value: string) => {
          const accountSearch = accounts.find((account: AccountResponse) => account.code === value);
          textUpdatedBy =
            textUpdatedBy + accountSearch?.code + " - " + accountSearch?.full_name + "; ";
        });
      } else if (updatedByAccounts.length === 1) {
        const updatedBy = updatedByAccounts[0];
        const accountSearch = accounts.find(
          (account: AccountResponse) => account.code === updatedBy,
        );
        textUpdatedBy = accountSearch?.code + " - " + accountSearch?.full_name;
      }
      listTag.push({
        key: DefectFilterEnum.updated_by,
        name: "Người thao tác",
        value: textUpdatedBy,
      });
    }
    return listTag;
  };

  const openFilter = () => {
    setIsVisible(true);
  };

  const validateFromQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const toQuantity = formAdv.getFieldValue(DefectFilterEnum.to_defect);
    if (!value) {
      setMessageErrorDefect("");
      return;
    }
    const defect = value.trim().replaceAll(",", "").replaceAll(".", "").replace(/\D+/g, "");
    if (!defect || !Number(defect)) {
      formAdv.setFieldsValue({
        [DefectFilterEnum.from_defect]: "",
      });
      return;
    }
    if (toQuantity && Number(defect) > toQuantity) {
      setMessageErrorDefect("Số lượng từ lớn hơn số lượng đến.");
      return;
    }
    formAdv.setFieldsValue({
      [DefectFilterEnum.from_defect]: Number(defect),
    });
    setMessageErrorDefect("");
  };

  const validateToQuality = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const fromQuantity = formAdv.getFieldValue(DefectFilterEnum.from_defect);
    if (!value) {
      setMessageErrorDefect("");
      return;
    }
    const defect = value.trim().replaceAll(",", "").replaceAll(".", "").replace(/\D+/g, "");
    if (!defect || !Number(defect)) {
      formAdv.setFieldsValue({
        [DefectFilterEnum.to_defect]: "",
      });
      return;
    }
    if (fromQuantity && Number(defect) < fromQuantity) {
      setMessageErrorDefect("Số lượng từ lớn hơn số lượng đến.");
      return;
    }
    formAdv.setFieldsValue({
      [DefectFilterEnum.to_defect]: Number(defect),
    });
    setMessageErrorDefect("");
  };

  const submitFormAdv = (values: InventoryDefectQuery) => {
    if (values.from_date || values.to_date) {
      values.from_date = getStartOfDayCommon(values.from_date as Date)?.format();
      values.to_date = getEndOfDayCommon(values.to_date as Date)?.format();
    }
    const valuesFilter = { ...formBase.getFieldsValue(true), ...values };
    filterDefects(valuesFilter);
  };

  const filterClick = () => {
    if (messageErrorDefect !== "") return;
    setIsVisible(false);
    formAdv.submit();
  };

  const cancelFilter = () => {
    setMessageErrorDefect("");
    setIsVisible(false);
  };

  return (
    <DefectHistoryFilterWrapper>
      <div className="custom-filter">
        <Form onFinish={filterBase} layout="inline" initialValues={formValues} form={formBase}>
          <Item style={{ flex: 1 }} name={DefectFilterEnum.condition} className="input-search">
            <Input
              allowClear
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo mã vạch, sku, tên sản phẩm."
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                e.key === KeyboardKey.Enter && formBase.submit();
              }}
              onBlur={(e) => {
                formBase.setFieldsValue({
                  [DefectFilterEnum.condition]: e.target.value.trim(),
                });
              }}
            />
          </Item>
          <Item name={DefectFilterEnum.store_ids} className="select-item">
            <Select
              autoClearSearchValue={false}
              style={{ width: "300px" }}
              placeholder="Chọn cửa hàng"
              maxTagCount={"responsive" as const}
              mode="multiple"
              showArrow
              showSearch
              allowClear
              filterOption={(input, option) => {
                if (option?.props.value) {
                  return strForSearch(option.props.children).includes(strForSearch(input));
                }
                return false;
              }}
            >
              {myStores?.length || stores?.length
                ? myStores?.length
                  ? myStores?.map((item: AccountStoreResponse, index: number) => (
                      <Option key={"store_id" + index} value={item.store_id?.toString() || ""}>
                        {item.store}
                      </Option>
                    ))
                  : stores?.map((item, index) => (
                      <Option key={"store_id" + index} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))
                : null}
            </Select>
          </Item>
          <Item>
            <Button htmlType="submit" type="primary">
              Lọc
            </Button>
          </Item>
          <Item>
            <Button icon={<FilterOutlined />} onClick={openFilter}>
              Thêm bộ lọc
            </Button>
          </Item>
          <Item style={{ margin: 0 }}>
            <ButtonSetting onClick={showColumnSetting} />
          </Item>
        </Form>
      </div>
      <BaseFilter
        onClearFilter={clearFilterClick}
        onFilter={filterClick}
        onCancel={cancelFilter}
        visible={isVisible}
        className="order-filter-drawer"
        width={700}
      >
        {isVisible && (
          <Form
            onFinish={submitFormAdv}
            ref={formRef}
            form={formAdv}
            initialValues={formValues}
            layout="vertical"
          >
            <FilterDefectHistoryAdvWrapper>
              <Row>
                <Col span={24}>
                  <Item
                    style={{ flex: 1 }}
                    name={DefectFilterEnum.condition}
                    className="input-search"
                  >
                    <Input
                      allowClear
                      prefix={<img src={search} alt="" />}
                      placeholder="Tìm kiếm theo mã vạch, sku, tên sản phẩm."
                      onBlur={(e) => {
                        formAdv.setFieldsValue({
                          [DefectFilterEnum.condition]: e.target.value.trim(),
                        });
                      }}
                    />
                  </Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <div className="font-weight-500">Số lượng lỗi</div>
                  <Input.Group compact>
                    <Item name={DefectFilterEnum.from_defect} className="from-defect">
                      <Input
                        onChange={validateFromQuantity}
                        className={`${messageErrorDefect !== "" && "error-border"}`}
                        placeholder="Từ"
                        maxLength={5}
                      />
                    </Item>
                    <span className="site-input-split">~</span>
                    <Item name={DefectFilterEnum.to_defect} className="to-defect">
                      <Input
                        onChange={validateToQuality}
                        className={` ${messageErrorDefect !== "" && "error-border"}`}
                        placeholder="Đến"
                        maxLength={5}
                      />
                    </Item>
                  </Input.Group>
                  <div className="error-message">{messageErrorDefect}</div>
                </Col>
                <Col span={12}>
                  <div className="font-weight-500 mb-10">Cửa hàng</div>
                  <Item name={DefectFilterEnum.store_ids} className="select-item">
                    <Select
                      autoClearSearchValue={false}
                      style={{ width: "300px" }}
                      placeholder="Chọn cửa hàng"
                      maxTagCount={"responsive" as const}
                      mode="multiple"
                      showArrow
                      showSearch
                      allowClear
                      filterOption={(input, option) => {
                        if (option?.props.value) {
                          return strForSearch(option.props.children).includes(strForSearch(input));
                        }
                        return false;
                      }}
                    >
                      {myStores?.length || stores?.length
                        ? myStores?.length
                          ? myStores?.map((item: AccountStoreResponse, index: number) => (
                              <Option
                                key={"store_id" + index}
                                value={item.store_id?.toString() || ""}
                              >
                                {item.store}
                              </Option>
                            ))
                          : stores?.map((item, index) => (
                              <Option key={"store_id" + index} value={item.id.toString()}>
                                {item.name}
                              </Option>
                            ))
                        : null}
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <div className="font-weight-500 mb-10">Người thao tác</div>
                  <Item name={DefectFilterEnum.updated_by}>
                    <AccountSearchPaging placeholder="Chọn người tạo" mode="multiple" showSearch />
                  </Item>
                </Col>
                <Col span={12}>
                  <div className="font-weight-500 mb-10">Ngày thao tác</div>
                  <CustomFilterDatePicker
                    fieldNameFrom={DefectFilterEnum.from_date}
                    fieldNameTo={DefectFilterEnum.to_date}
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />
                </Col>
              </Row>
            </FilterDefectHistoryAdvWrapper>
          </Form>
        )}
      </BaseFilter>

      <div className="filter-tags">
        {renderTagFilter().map((filter: DefectFilterTag) => {
          return (
            <Tag className="tag" closable onClose={(e) => closeTag(e, filter)}>
              {filter.name}: {filter.value}
            </Tag>
          );
        })}
      </div>
    </DefectHistoryFilterWrapper>
  );
};

export default InventoryHistoryDefectFilter;
