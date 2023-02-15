import React, { createRef, useEffect, useState } from "react";
import { Button, Col, Form, FormInstance, Input, Row, Select, Tag } from "antd";
import search from "assets/img/search.svg";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { AccountStoreResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { InventoryDefectQuery } from "model/inventory-defects";
import { DefectFilterEnum, DefectFilterTag } from "model/inventory-defects/filter";
import { strForSearch } from "utils/StringUtils";
import "assets/css/custom-filter.scss";
import { FilterOutlined } from "@ant-design/icons";
import BaseFilter from "component/filter/base.filter";
import { FilterDefectAdvWrapper, InventoryDefectFilterWrapper } from "./styles";
import { KeyboardKey } from "model/other/keyboard/keyboard.model";

type InventoryDefectFilterProps = {
  menuClick: (index: number) => void;
  menuAction: Array<MenuAction>;
  params: InventoryDefectQuery;
  myStores?: Array<AccountStoreResponse>;
  stores: Array<StoreResponse>;
  showColumnSetting: () => void;
  filterDefects: (value: InventoryDefectQuery) => void;
  clearFilterDefect: () => void;
};

const InventoryDefectFilter: React.FC<InventoryDefectFilterProps> = (
  props: InventoryDefectFilterProps,
) => {
  const {
    menuClick,
    menuAction,
    params,
    myStores,
    stores,
    showColumnSetting,
    filterDefects,
    clearFilterDefect,
  } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [messageErrorDefect, setMessageErrorDefect] = useState("");
  const [formBase] = Form.useForm();
  const [formAdv] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const { Item } = Form;
  const { Option } = Select;

  const formValues = {
    ...params,
  };

  useEffect(() => {
    const filter = {
      ...params,
    };
    formBase.setFieldsValue({
      [DefectFilterEnum.condition]: filter.condition,
      [DefectFilterEnum.store_ids]: filter.store_ids,
    });
    formAdv.setFieldsValue(filter);
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
        (formValues.from_defect ? formValues.from_defect : "??") +
        " ~ " +
        (formValues.to_defect ? formValues.to_defect : "??");
      listTag.push({
        key: DefectFilterEnum.defect_quantity,
        name: "Số lỗi",
        value: textDefect,
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
    <InventoryDefectFilterWrapper>
      <div className="custom-filter">
        <CustomFilter onMenuClick={menuClick} menu={menuAction}>
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
                filterOption={(input: String, option: any) => {
                  if (option.props.value) {
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
        </CustomFilter>
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
            <FilterDefectAdvWrapper>
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
                      filterOption={(input: String, option: any) => {
                        if (option.props.value) {
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
              </Row>
            </FilterDefectAdvWrapper>
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
    </InventoryDefectFilterWrapper>
  );
};

export default InventoryDefectFilter;
