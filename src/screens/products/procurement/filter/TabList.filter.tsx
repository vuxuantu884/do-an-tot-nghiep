import { FilterOutlined } from "@ant-design/icons";
import { Button, Collapse, Form, Input, Space, Tag } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import CustomRangePicker from "component/filter/component/range-picker.custom";
import SelectMerchandisers from "component/filter/component/select-merchandisers";
import SelectStoreField from "component/filter/component/select-store-field";
import UrlConfig from "config/url.config";
import { ProcurementQuery } from "model/purchase-order/purchase-procument";
import moment from "moment";
import querystring from "querystring";
import React, { Fragment, useCallback, useState } from "react";
import { useHistory } from "react-router";
import { ProcurementStatus, ProcurementStatusName } from "utils/Constants";
import { checkFixedDate, DATE_FORMAT } from "utils/DateUtils";
import { FilterProcurementStyle, ProcurementStatusStyle } from "./styles";
const { Item } = Form;
const BaseProcumentField = {
  content: "content",
  merchandiser: "merchandiser",
};

interface ProcurementFilter {
  stockDate: string;
  stockUser: string;
  confirmDate: string;
  confirmUser: string;
  status: string;
  cancelDate: string;
  merchandisers: string;
  store: string;
}

const ProcurementFilterItem = {
  stockDate: "stockDate",
  confirmDate: "confirmDate",
  status: "status",
  // cancelDate: "cancelDate",
  store: "store",
};

const ProcurementFilterName = {
  [ProcurementFilterItem.stockDate]: "Ngày duyệt phiếu nhập",
  [ProcurementFilterItem.confirmDate]: "Ngày nhập kho",
  [ProcurementFilterItem.status]: "Trạng thái phiếu nhập kho",
  // [ProcurementFilterItem.cancelDate]: "Ngày huỷ phiếu nhập",
  [ProcurementFilterItem.store]: "Kho nhận hàng",
};
const TAP_ID = 2;
const { Panel } = Collapse;
function TabListFilter() {
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  let [advanceFilters, setAdvanceFilters] = useState<any>({});

  const [formBase] = useForm();
  const [formAdvanced] = useForm();

  const openVisibleFilter = () => {
    setVisible(true);
  };
  const cancelFilter = () => {
    setVisible(false);
  };
  const resetFilter = () => {
    formAdvanced.resetFields();
    formAdvanced.submit();
    setVisible(false);
  };

  const resetField = useCallback(
    (field: string) => {
      formAdvanced.setFieldsValue({
        ...formAdvanced.getFieldsValue(true),
        [field]: undefined,
      });
      formAdvanced.submit();
    },
    [formAdvanced]
  );

  const onAdvanceFinish = (data: ProcurementFilter) => {
    console.log(data);

    setVisible(false);
    const params: ProcurementQuery = {} as ProcurementQuery;
    //duyet phieu
    if (data.stockDate) {
      params.active_from = data.stockDate[0];
      params.active_to = data.stockDate[1];
    }
    // xac nhan phieu
    if (data.confirmDate) {
      params.stock_in_from = data.confirmDate[0];
      params.stock_in_to = data.confirmDate[1];
    }
    // //huy phieu
    // if (data.cancelDate) {
    //   params.stock_in_from = data.cancelDate[0];
    //   params.stock_in_to = data.cancelDate[1];
    // }

    //trang thai
    if (data.status) {
      params.status = data.status.toString();
    }

    //cua hang
    if (data?.store) params.store = data.store.toString();

    const formBaseData = formBase.getFieldsValue(true);
    setAdvanceFilters(data);
    history.replace(
      `${UrlConfig.PROCUREMENT}/${TAP_ID}?${querystring.stringify({
        ...params,
        ...formBaseData,
      })}`
    );
  };
  const onBaseFinish = (data: any) => {
    console.log(data);
    data.merchandiser = data?.merchandiser?.toString();
    const formAdvanceData = formAdvanced.getFieldsValue(true);

    history.push(
      `${UrlConfig.PROCUREMENT}/${TAP_ID}?${querystring.stringify({
        ...formAdvanceData,
        ...data,
      })}`
    );
  };

  const handleClickStatus = (value: string) => {
    let statusList = advanceFilters?.status || [];
    if (statusList && !statusList.includes(value)) {
      statusList.push(value);
    } else if (statusList && statusList.includes(value)) {
      const index = statusList.indexOf(value);
      if (index > -1) {
        statusList.splice(index, 1);
      }
    } else {
      advanceFilters.status = [];
      statusList.push(value);
    }
    advanceFilters.status = statusList;
    formAdvanced.setFieldsValue(advanceFilters);
    setAdvanceFilters({ ...advanceFilters });
  };
  return (
    <Form.Provider>
      <Form onFinish={onBaseFinish} form={formBase} layout="inline">
        <FilterProcurementStyle>
          <Item name={BaseProcumentField.content} className="search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm phiếu nhập kho, đơn mua hàng, nhà cung cấp"
            />
          </Item>
          <Item name={BaseProcumentField.merchandiser} className="merchandisers">
            <SelectMerchandisers isMulti allowClear />
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
            {/* <Item><ButtonSetting onClick={openColumn} /></Item> */}
          </div>
        </FilterProcurementStyle>
      </Form>

      {advanceFilters && <FilterList filters={advanceFilters} resetField={resetField} />}
      <BaseFilter
        onClearFilter={resetFilter}
        onFilter={() => {
          formAdvanced.submit();
        }}
        onCancel={cancelFilter}
        visible={visible}
        width={500}
      >
        <Form onFinish={onAdvanceFinish} initialValues={{}} form={formAdvanced}>
          <Space className="po-filter" direction="vertical" style={{ width: "100%" }}>
            {Object.keys(ProcurementFilterItem).map((field) => {
              let component: any = null;
              switch (field) {
                case ProcurementFilterItem.stockDate:
                case ProcurementFilterItem.confirmDate:
                  // case ProcurementFilterItem.cancelDate:
                  component = <CustomRangePicker />;
                  break;

                case ProcurementFilterItem.store:
                  component = <SelectStoreField isMulti />;
                  break;

                case ProcurementFilterItem.status:
                  component = (
                    <ProcurementStatusStyle>
                      {Object.keys(ProcurementStatus).map((item) => (
                        <Button
                          value={item}
                          onClick={() => handleClickStatus(item)}
                          className={
                            advanceFilters?.status?.includes(item) ? "active" : ""
                          }
                        >
                          {ProcurementStatusName[item]}
                        </Button>
                      ))}
                    </ProcurementStatusStyle>
                  );
                  break;
              }
              return (
                <Collapse key={field}>
                  <Panel
                    key="1"
                    header={<span>{ProcurementFilterName[field]?.toUpperCase()}</span>}
                  >
                    <Item name={field}>{component}</Item>
                  </Panel>
                </Collapse>
              );
            })}
          </Space>
        </Form>
      </BaseFilter>
    </Form.Provider>
  );
}

const FilterList = ({ filters, resetField }: any) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt: any = null;
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return <Fragment />;

        if (!ProcurementFilterName[filterKey]) return <Fragment />;

        switch (filterKey) {
          case ProcurementFilterItem.stockDate:
          case ProcurementFilterItem.confirmDate:
            // case ProcurementFilterItem.cancelDate:
            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate)
              renderTxt = `${ProcurementFilterName[filterKey]} : ${fixedDate}`;
            else
              renderTxt = `${ProcurementFilterName[filterKey]} : ${formatedFrom} - ${formatedTo}`;
            break;

          case ProcurementFilterItem.store:
            if (Array.isArray(value) && value.length > 0) {
              renderTxt = `${ProcurementFilterName[filterKey]} : ${value}`;
            }
            break;
          case ProcurementFilterItem.status:
            if (Array.isArray(value) && value.length > 0) {
              let statusText = "";
              value?.forEach(
                (item: string) => (statusText += ", " + ProcurementStatusName[item])
              );
              renderTxt = `${ProcurementFilterName[filterKey]} : ${statusText.substr(1)}`;
            }
        }
        if (!renderTxt) return <Fragment />;
        return (
          <Tag
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </Space>
  );
};
export default TabListFilter;
