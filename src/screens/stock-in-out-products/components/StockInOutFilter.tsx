import { Button, Col, Form, Input, Row, Select } from "antd";
import { FilterStockInOutStyle, StockInOutStatusStyle } from "./filter-style";
import search from "assets/img/search.svg";
import TreeStore from "component/TreeStore";
import { useForm } from "antd/lib/form/Form";
import { FilterOutlined } from "@ant-design/icons";
import ButtonSetting from "component/table/ButtonSetting";
import { createRef, useCallback, useEffect, useState } from "react";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import {
  StockInOutAdvancedFilter,
  StockInOutAdvancedFilterMapping,
  StockInOutBaseFilter,
  StockInOutBaseFilterMapping,
  StockInOutOthersType,
  StockInOutStatus,
  StockInOutStatusMapping,
  StockInOutTypeMapping,
  stockInReason,
  StockInReasonMappingField,
  stockOutReason,
  StockOutReasonMappingField,
} from "../constant";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch } from "react-redux";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { useHistory } from "react-router-dom";
import { formatFieldTag, generateQuery, transformParamsToObject } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import { debounce, isArray } from "lodash";
import { useArray } from "hook/useArray";
import BaseFilterResult from "component/base/BaseFilterResult";
import BaseFilter from "component/filter/base.filter";
import { FormInstance } from "antd/es/form/Form";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import {
  DATE_FORMAT,
  formatDateFilter,
  formatDateTimeFilter,
  splitDateRange,
} from "utils/DateUtils";
import moment from "moment";
import useHandleFilterConfigs from "hook/useHandleFilterConfigs";
import FilterConfigModal from "component/modal/FilterConfigModal";
import { FILTER_CONFIG_TYPE } from "utils/Constants";
import BaseResponse from "base/base.response";
import { FilterConfig } from "model/other";
import UserCustomFilterTag from "component/filter/UserCustomFilterTag";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import "./stock-in-out.filter.scss";
import CustomSelect from "component/custom/select.custom";
import CustomFilter from "component/table/custom.filter";
import { MenuAction } from "component/table/ActionButton";
import "assets/css/custom-filter.scss";

interface StockInOutFilterProps {
  onClickOpen?: () => void;
  paramsUrl?: any;
  actions: Array<MenuAction>;
  onMenuClick: (index: number) => void;
}

const StockInOutFilter: React.FC<StockInOutFilterProps> = (props: StockInOutFilterProps) => {
  const { onClickOpen, paramsUrl, actions, onMenuClick } = props;
  const [allStore, setAllStore] = useState<Array<StoreResponse>>();
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState("");
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([]);
  const { array: selectedStatuses, set: setSelectedStatuses, remove: removeStatus } = useArray([]);
  const [isShowModalSaveFilter, setIsShowModalSaveFilter] = useState(false);
  const [formSearchValuesToSave, setFormSearchValuesToSave] = useState({});
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const [tagActive, setTagActive] = useState<number | null>();
  const { Item } = Form;
  const [formBase] = useForm();
  const [formAdvanced] = useForm();
  const formRef = createRef<FormInstance>();

  const openVisibleFilter = () => setVisible(true);
  const cancelFilter = () => setVisible(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const filterConfigType = FILTER_CONFIG_TYPE.FILTER_STOCK_IN_OUT;

  const onHandleFilterTagSuccessCallback = (res: BaseResponse<FilterConfig>) => {
    setTagActive(res.data.id);
  };

  const onShowSaveFilter = useCallback(() => {
    let values = formRef.current?.getFieldsValue();
    setFormSearchValuesToSave(values);
    setIsShowModalSaveFilter(true);
  }, [formRef]);

  const {
    filterConfigs,
    onSaveFilter,
    configId,
    setConfigId,
    handleDeleteFilter,
    onSelectFilterConfig,
  } = useHandleFilterConfigs(
    filterConfigType,
    formRef,
    {
      ...formSearchValuesToSave,
    },
    setTagActive,
    onHandleFilterTagSuccessCallback,
  );

  useEffect(() => {
    const getStores = async () => {
      const res = await callApiNative({ isShowError: true }, dispatch, getStoreApi, {
        status: "active",
        simple: true,
      });
      if (res) {
        setAllStore(res);
      }
    };
    getStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateRange = (from: Date, to: Date) => {
    if (!from && !to) return;
    return `${from ? moment(from).utc(false).format(DATE_FORMAT.DDMMYY_HHmm) : "??"} ~ ${
      to ? moment(to).utc(false).format(DATE_FORMAT.DDMMYY_HHmm) : "??"
    }`;
  };

  const resetFilter = () => {
    let fields = formAdvanced.getFieldsValue(true);
    for (let key in fields) {
      if (fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = null;
      }
    }
    formAdvanced.resetFields();
    formAdvanced.submit();
    setVisible(false);
    setTagActive(undefined);
  };

  useEffect(() => {
    const newParams = {
      ...paramsUrl,
      created_date: formatDateRange(paramsUrl.created_date_from, paramsUrl.created_date_to),
    };
    // delete params date
    const { created_date_from, created_date_to, ...rest } = newParams;
    const formatted = formatFieldTag(rest, {
      ...StockInOutBaseFilterMapping,
      ...StockInOutAdvancedFilterMapping,
    });
    const transformParams = formatted.map((item) => {
      switch (item.keyId) {
        case StockInOutBaseFilter.stores:
          if (isArray(item.valueId)) {
            const filterStore = allStore?.filter((elem) =>
              item.valueId.find((id: number) => +elem.id === +id),
            );
            if (filterStore)
              return {
                ...item,
                valueName: filterStore?.map((item: any) => item.name).toString(),
              };
          }
          const findStore = allStore?.find((store) => +store.id === +item.valueId);
          return { ...item, valueName: findStore?.name };
        case StockInOutBaseFilter.type:
          return {
            ...item,
            valueName: `Phiếu ${StockInOutTypeMapping[item.valueId]}`,
          };
        case StockInOutAdvancedFilter.status:
          let statuses: any = [];
          if (isArray(item.valueId)) {
            item.valueId.forEach((item: any) => {
              statuses.push(StockInOutStatusMapping[item]);
            });
          } else {
            statuses = StockInOutStatusMapping[item.valueId];
          }
          return { ...item, valueName: statuses?.toString() };
        case StockInOutBaseFilter.content:
        case StockInOutAdvancedFilter.internal_note:
        case StockInOutAdvancedFilter.partner_name:
        case StockInOutAdvancedFilter.created_by:
        case StockInOutAdvancedFilter.account_codes:
        case StockInOutAdvancedFilter.created_date:
          return { ...item, valueName: item.valueId.toString() };
        case StockInOutAdvancedFilter.stock_in_reasons:
          if (isArray(item.valueId)) {
            const stockInReason = item.valueId.map((el: any) => {
              return StockInReasonMappingField[el];
            });
            return { ...item, valueName: stockInReason.toString() };
          } else {
            return {
              ...item,
              valueName: StockInReasonMappingField[item.valueId],
            };
          }
        case StockInOutAdvancedFilter.stock_out_reasons:
          if (isArray(item.valueId)) {
            const stockOutReason = item.valueId.map((item: any) => {
              return StockOutReasonMappingField[item];
            });
            return { ...item, valueName: stockOutReason.toString() };
          } else {
            return {
              ...item,
              valueName: StockOutReasonMappingField[item.valueId],
            };
          }
        default:
          return item;
      }
    });
    setParamsArray(transformParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUrl, JSON.stringify(allStore)]);

  useEffect(() => {
    // const filters = convertParams(paramsUrl);
    formBase.setFieldsValue({
      [StockInOutBaseFilter.stores]: paramsUrl.stores
        ?.toString()
        ?.split(",")
        .map((x: string) => parseInt(x)),
      [StockInOutBaseFilter.content]: paramsUrl.content,
      [StockInOutBaseFilter.type]: paramsUrl.type,
    });
    formAdvanced.setFieldsValue({
      ...paramsUrl,
      status: paramsUrl.status,
      created_date_from: formatDateFilter(paramsUrl.created_date_from),
      created_date_to: formatDateFilter(paramsUrl.created_date_to),
      account_codes: paramsUrl.account_codes?.toString()?.split(","),
      created_by: paramsUrl.created_by?.toString()?.split(","),
      partner_name: paramsUrl.partner_name,
      internal_note: paramsUrl.internal_note,
      stock_in_reasons: paramsUrl.stock_in_reasons?.toString()?.split(","),
      stock_out_reasons: paramsUrl.stock_out_reasons?.toString()?.split(","),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUrl, formBase]);

  const removeDate = (params: any, key: string) => {
    const { start, end } = splitDateRange(params[key]);
    params[`${key}_from`] = start !== "??" ? start : undefined;
    params[`${key}_to`] = end !== "??" ? end : undefined;
  };

  //watch remove tag
  useEffect(() => {
    (async () => {
      if (paramsArray.length < (prevArray?.length || 0)) {
        const filterStatusInParams = paramsArray
          .filter((item: any) => item.keyId === "status")
          .map((param: any) => param.status);
        setSelectedStatuses(filterStatusInParams);
        let newParams = transformParamsToObject(paramsArray);
        if (newParams?.created_date) {
          removeDate(newParams, StockInOutAdvancedFilter.created_date);
          const { start, end } = splitDateRange(newParams[StockInOutAdvancedFilter.created_date]);
          newParams = {
            ...newParams,
            created_date_from:
              start !== "??"
                ? formatDateTimeFilter(start, "DD/MM/YYYY HH:mm")?.format()
                : undefined,
            created_date_to:
              end !== "??" ? formatDateTimeFilter(end, "DD/MM/YYYY HH:mm")?.format() : undefined,
          };
        }
        delete newParams[StockInOutAdvancedFilter.created_date];
        await history.push(`${history.location.pathname}?${generateQuery(newParams)}`);
      }
    })();
  }, [setSelectedStatuses, paramsArray, history, prevArray]);

  const onBaseFinish = (data: any) => {
    let queryParam = generateQuery({ ...paramsUrl, ...data, page: 1 });
    history.replace(`${UrlConfig.STOCK_IN_OUT_OTHERS}?${queryParam}`);
  };

  const onAdvanceFinish = (data: any) => {
    setVisible(false);
    const statuses = formAdvanced.getFieldValue([StockInOutAdvancedFilter.status]);
    if (typeof statuses === "string") {
      setSelectedStatuses([statuses]);
    } else {
      setSelectedStatuses(statuses);
    }
    let queryParam = generateQuery({
      ...paramsUrl,
      ...data,
      page: 1,
      created_date_from: formatDateTimeFilter(data.created_date_from, "DD/MM/YYYY HH:mm")?.format(),
      created_date_to: formatDateTimeFilter(data.created_date_to, "DD/MM/YYYY HH:mm")?.format(),
    });
    history.replace(`${UrlConfig.STOCK_IN_OUT_OTHERS}?${queryParam}`);
  };

  const onRemoveStatus = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const onSearch = debounce((value: string) => {
    let queryParam = generateQuery({
      ...paramsUrl,
      page: 1,
      [StockInOutBaseFilter.content]: value,
    });
    history.replace(`${UrlConfig.STOCK_IN_OUT_OTHERS}?${queryParam}`);
  }, 300);

  const handleClickStatus = (value: string) => {
    const findSelected = selectedStatuses.find((status) => status === value);
    if (!findSelected) {
      setSelectedStatuses([...selectedStatuses, value]);
    } else {
      const findIndexSelected = selectedStatuses.findIndex((status) => status === value);
      removeStatus(findIndexSelected);
    }
  };

  useEffect(() => {
    setSelectedStatuses(selectedStatuses ?? []);
    formAdvanced.setFieldsValue({
      ...formAdvanced.getFieldsValue(),
      status: selectedStatuses ?? [],
    });
  }, [setSelectedStatuses, selectedStatuses, formAdvanced]);

  const onMenuDeleteConfigFilter = () => {
    handleDeleteFilter(configId);
    setIsShowConfirmDelete(false);
  };

  return (
    <Form.Provider>
      <div className="custom-filter">
        <FilterStockInOutStyle>
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Form form={formBase} onFinish={onBaseFinish} layout="inline">
              <Item
                name={StockInOutBaseFilter.content}
                rules={[{ max: 255, message: "Không thể tìm kiếm quá 255 ký tự" }]}
              >
                <Input
                  prefix={<img src={search} alt="" />}
                  style={{ minWidth: 350 }}
                  allowClear
                  placeholder="Tìm kiếm theo mã phiếu, sản phẩm"
                  onChange={(e: any) => {
                    const value = e.target.value;
                    if (value.length > 2 && value.length <= 255) {
                      onSearch(value);
                    }
                  }}
                />
              </Item>
              <Item name={StockInOutBaseFilter.stores} className="stores">
                <TreeStore
                  style={{ minWidth: 200 }}
                  placeholder="Tìm kho hàng"
                  storeByDepartmentList={allStore as unknown as StoreByDepartment[]}
                />
              </Item>
              <Item name={StockInOutBaseFilter.type}>
                <Select style={{ minWidth: 125, height: 38 }} placeholder="Chọn loại phiếu">
                  {StockInOutOthersType.map((item, i) => {
                    return (
                      <Select.Option key={i} value={item.key} color="#222222">
                        {item.value}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Item>
              <div className="btn-action">
                <Item>
                  <Button type="primary" htmlType="submit">
                    Lọc
                  </Button>
                </Item>

                <Item>
                  <Button icon={<FilterOutlined />} onClick={openVisibleFilter}>
                    Thêm bộ lọc
                  </Button>
                </Item>
                <Item>
                  <ButtonSetting onClick={onClickOpen} />
                </Item>
              </div>
            </Form>
          </CustomFilter>
        </FilterStockInOutStyle>
      </div>
      <BaseFilter
        onClearFilter={resetFilter}
        onFilter={formAdvanced.submit}
        onCancel={cancelFilter}
        visible={visible}
        allowSave
        onSaveFilter={onShowSaveFilter}
        width={700}
        className="stock-in-out-drawer"
      >
        <Form ref={formRef} onFinish={onAdvanceFinish} form={formAdvanced}>
          {filterConfigs && filterConfigs.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {filterConfigs?.map((e, index) => {
                return (
                  <UserCustomFilterTag
                    key={index}
                    tagId={e.id}
                    name={e.name}
                    onSelectFilterConfig={(tagId) => {
                      onSelectFilterConfig(tagId);
                    }}
                    setConfigId={setConfigId}
                    setIsShowConfirmDelete={setIsShowConfirmDelete}
                    tagActive={tagActive}
                  />
                );
              })}
            </div>
          )}
          <Row gutter={20}>
            {Object.values(StockInOutAdvancedFilter).map((field) => {
              let component: any = null;
              switch (field) {
                case StockInOutAdvancedFilter.stock_in_reasons:
                  component = (
                    <CustomSelect
                      maxTagCount="responsive"
                      mode="multiple"
                      style={{ width: "100%" }}
                      showArrow
                      placeholder="Chọn lý do nhập"
                      notFoundContent="Không tìm thấy kết quả"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      {stockInReason.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.key}
                        >
                          {item.value}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  );
                  break;
                case StockInOutAdvancedFilter.stock_out_reasons:
                  component = (
                    <CustomSelect
                      maxTagCount="responsive"
                      mode="multiple"
                      style={{ width: "100%" }}
                      showArrow
                      placeholder="Chọn lý do xuất"
                      notFoundContent="Không tìm thấy kết quả"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      {stockOutReason.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.key}
                        >
                          {item.value}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  );
                  break;
                case StockInOutAdvancedFilter.account_codes:
                  component = (
                    <AccountSearchPaging mode="multiple" placeholder="Chọn người đề xuất" />
                  );
                  break;
                case StockInOutAdvancedFilter.created_by:
                  component = <AccountSearchPaging mode="multiple" placeholder="Chọn người tạo" />;
                  break;
                case StockInOutAdvancedFilter.partner_name:
                  component = <Input placeholder="Nhập tên đối tác" />;
                  break;
                case StockInOutAdvancedFilter.created_date:
                  component = (
                    <CustomFilterDatePicker
                      fieldNameFrom={`${field}_from`}
                      fieldNameTo={`${field}_to`}
                      activeButton={dateClick}
                      setActiveButton={setDateClick}
                      formRef={formRef}
                      format="DD/MM/YYYY HH:mm"
                      showTime
                    />
                  );
                  break;
                case StockInOutAdvancedFilter.status:
                  component = (
                    <StockInOutStatusStyle>
                      {Object.keys(StockInOutStatus).map((item) => (
                        <Button
                          key={item}
                          value={item}
                          onClick={() => handleClickStatus(item)}
                          className={selectedStatuses?.includes(item) ? "active" : ""}
                        >
                          {StockInOutStatusMapping[item]}
                        </Button>
                      ))}
                    </StockInOutStatusStyle>
                  );
                  break;
                case StockInOutAdvancedFilter.internal_note:
                  component = <Input.TextArea placeholder="Tìm kiếm theo nội dung ghi chú" />;
                  break;
              }
              return (
                <Col span={12} key={field}>
                  <div className="font-weight-500">{StockInOutAdvancedFilterMapping[field]}</div>
                  {field === StockInOutAdvancedFilter.internal_note ? (
                    <Item
                      name={field}
                      rules={[
                        {
                          max: 255,
                          message: "Thông tin tìm kiếm không được quá 255 ký tự",
                        },
                      ]}
                    >
                      {component}
                    </Item>
                  ) : (
                    <Item name={field}>{component}</Item>
                  )}
                </Col>
              );
            })}
          </Row>
        </Form>
      </BaseFilter>
      <BaseFilterResult data={paramsArray} onClose={onRemoveStatus} />
      <FilterConfigModal
        setVisible={setIsShowModalSaveFilter}
        visible={isShowModalSaveFilter}
        onOk={(formValues) => {
          setIsShowModalSaveFilter(false);
          onSaveFilter(formValues);
        }}
        filterConfigs={filterConfigs}
      />
      <ModalDeleteConfirm
        visible={isShowConfirmDelete}
        onOk={onMenuDeleteConfigFilter}
        onCancel={() => setIsShowConfirmDelete(false)}
        title="Xác nhận"
        subTitle={
          <span>
            Bạn có chắc muốn xóa bộ lọc{" "}
            <strong>
              "{filterConfigs.find((single) => single.id === configId)?.name || null}"
            </strong>
          </span>
        }
      />
    </Form.Provider>
  );
};

export default StockInOutFilter;
