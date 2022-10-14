import { Card, DatePicker, Form, FormInstance, Select, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import ContentContainer from "component/container/content.container";
import { KEY_DRIVER_ONLINE_COUNTER } from "config/report/key-driver-online-counter";
import UrlConfig from "config/url.config";
import { DepartmentLevel4, DepartmentLevelGroup } from "model/report";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useEffectOnce } from "react-use";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { fullTextSearch } from "utils/StringUtils";
import {
  convertDepartmentLv4AndMonthlyCounterToDataTable,
  getColumnByDate,
  getDepartmentLevel4ByShop,
  getMonthlyCounterByDepartmentLevel3,
  getShopListByDate
} from "./helper";
import { KeyDriverOnlineCounterStyled } from "./style";

function KeyDriverOnlineCounter() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [columns, setColumns] = React.useState<ColumnsType<any>>([]);
  const [shopList, setShopList] = React.useState<DepartmentLevelGroup[]>([]);
  const [departmentLv4List, setDepartmentLv4List] = useState<Array<DepartmentLevel4>>([]);
  const [dataSrc, setDataSrc] = useState<any[]>([]);

  const initColumnTable = async (shopList: DepartmentLevelGroup[]) => {
    const keyDriver = form.getFieldValue("key_driver").split(' - ')[0].toLowerCase();
    const selectedDate: Moment = form.getFieldValue("date");

    const selectedShopIndex: number = form.getFieldValue("shop");
    if (shopList.length > 0 && selectedShopIndex) {
      const departmentLv1 = shopList[selectedShopIndex].department_lv1;
      const departmentLv2 = shopList[selectedShopIndex].department_lv2;
      const departmentLv3 = shopList[selectedShopIndex].department_lv3;

      const columnByDate: ColumnsType<any> = getColumnByDate(
        keyDriver,
        selectedDate,
        departmentLv1,
        departmentLv2,
        departmentLv3,
        dispatch,
      );
      setColumns(columnByDate);
    }
  };

  const loadDataSrc = async (
    shopList: DepartmentLevelGroup[],
    form: FormInstance,
    departmentLevel4List?: Array<any>,
  ) => {
    const selectedShopIndex = form.getFieldValue("shop");
    const departmentLv1 = shopList[selectedShopIndex].department_lv1;
    const departmentLv2 = shopList[selectedShopIndex].department_lv2;
    const departmentLv3 = shopList[selectedShopIndex].department_lv3;
    let dpmLv4List = [];
    if (departmentLevel4List) {
      dpmLv4List = departmentLevel4List;
    } else {
      dpmLv4List = await getDepartmentLevel4ByShop(departmentLv2, departmentLv3, dispatch);
      setDepartmentLv4List(dpmLv4List);
    }

    const savedMonthlyCounter = await getMonthlyCounterByDepartmentLevel3(
      departmentLv1,
      departmentLv2,
      departmentLv3,
      form,
      dispatch,
    );
    const dataTable = convertDepartmentLv4AndMonthlyCounterToDataTable(
      dpmLv4List,
      savedMonthlyCounter,
    );
    return dataTable;
  };

  const handleDateChange = async (date: moment.Moment) => {
    const data = await loadDataSrc(shopList, form, departmentLv4List);
    setDataSrc(data);
    initColumnTable(shopList);
  };
  const handleChangeKeyDriver = async () => {
    const data = await loadDataSrc(shopList, form, departmentLv4List);
    setDataSrc(data);
    initColumnTable(shopList);
  };

  const onSelectShop = async (value: number) => {
    const data = await loadDataSrc(shopList, form);
    setDataSrc(data);
    initColumnTable(shopList);
  };

  useEffectOnce(() => {
    const initShopList = async () => {
      const response = await getShopListByDate(
        dispatch,
        moment("2022-07-31", DATE_FORMAT.YYYYMMDD),
      ); // draft date
      setShopList(response);
    };
    initShopList();
  });

  useEffect(() => {
    initColumnTable(shopList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopList]);

  return (
    <ContentContainer
      title="Nhập chỉ số báo cao doanh thu online"
      breadcrumb={[
        { name: "Báo cáo kinh doanh online", path: UrlConfig.KEY_DRIVER_ONLINE },
        { name: "Nhập chỉ số báo cao kinh doanh online" },
      ]}
    >
      <KeyDriverOnlineCounterStyled>
        <Card title="Bộ lọc" bodyStyle={{ paddingBottom: 0 }}>
          <Form
            form={form}
            layout="vertical"
            className="filter-container"
            initialValues={{
              // date: moment(),
              date: moment(new Date(), DATE_FORMAT.YYYYMMDD), // draft
              key_driver: KEY_DRIVER_ONLINE_COUNTER[0].value,
            }}
          >
            <Form.Item label="Tháng" name={"date"}>
              <DatePicker
                picker="month"
                format={DATE_FORMAT.MMYYYY}
                className="form-input"
                onChange={(value: Moment | null, dateString: string) =>
                  value && handleDateChange(value)
                }
              />
            </Form.Item>
            <Form.Item label="Shop" name={"shop"}>
              <Select
                className="form-input"
                placeholder="Chọn shop online"
                filterOption={(input, option) => fullTextSearch(input, option?.children || "")}
                showSearch
                onChange={onSelectShop}
              >
                {shopList.map(
                  ({ department_lv2, department_lv3, department_lv4 }, index: number) => (
                    <Select.Option
                      key={department_lv2 + department_lv3 + department_lv4}
                      value={index}
                    >
                      {department_lv3}
                    </Select.Option>
                  ),
                )}
              </Select>
            </Form.Item>
            <Form.Item label="Chọn chỉ số" name="key_driver">
              <Select
                className="form-input"
                placeholder="Chọn chỉ số"
                filterOption={(input, option) => fullTextSearch(input, option?.children || "")}
                showSearch
                options={KEY_DRIVER_ONLINE_COUNTER}
                onChange={handleChangeKeyDriver}
              />
            </Form.Item>
          </Form>
        </Card>
        <Card>
          <Table
            columns={columns}
            dataSource={dataSrc}
            pagination={false}
            sticky={{ offsetHeader: OFFSET_HEADER_UNDER_NAVBAR, offsetScroll: 5 }}
            scroll={{ x: "max-content" }}
            key="account_code"
            rowKey={(record: any) => record.account_code}
          />
        </Card>
      </KeyDriverOnlineCounterStyled>
    </ContentContainer>
  );
}

export default KeyDriverOnlineCounter;
