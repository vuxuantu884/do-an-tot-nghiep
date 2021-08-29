import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { actionFetchListPrinter } from "domain/actions/printer/printer.action";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  BasePrinterModel,
  PrinterResponseModel,
} from "model/response/printer.response";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { generateQuery } from "utils/AppUtils";
import IconEdit from "./images/iconEdit.svg";
import IconPrintHover from "./images/iconPrintHover.svg";
import { StyledComponent } from "./styles";

type StoreType = {
  id: number;
  name: string;
}[];

const SettingPrinter: React.FC = () => {
  const FAKE_PRINT_CONTENT = "<p>This is fake print content print screen</p>";
  const printElementRef = useRef(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [selectStoreId, setSelectStoreId] = useState<any>(null);
  const [listPrinter, setListPrinter] = useState<BasePrinterModel[]>([]);
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const [total, setTotal] = useState(0);

  const history = useHistory();
  const dispatch = useDispatch();

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  const [form] = Form.useForm();
  const initialFormValue = {
    searchInput: searchInputValue,
  };

  const query = useQuery();

  let queryStoreId = query.get("store_id");
  let queryName = query.get("name");

  let [queryParams, setQueryParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 20),
    name: queryName || "",
    store_id: queryStoreId || "",
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      queryParams.page = page;
      queryParams.limit = size;
      let queryParam = generateQuery(queryParams);
      setQueryParams({ ...queryParams });
      history.replace(`${UrlConfig.PRINTER}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, queryParams]
  );

  const goToPageDetail = (id: string | number) => {
    history.push(`${UrlConfig.PRINTER}/${id}`);
  };

  const [listStores, setListStores] = useState<StoreType>([]);

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const handleEdit = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    id: string | number
  ) => {
    e.stopPropagation();
    history.push(`${UrlConfig.PRINTER}/${id}?action=edit`);
  };

  const columns: ICustomTableColumType<any>[] = [
    {
      title: "STT",
      visible: true,
      width: "5%",
      render: (value, row, index) => {
        return (
          <span>{(queryParams.page - 1) * queryParams.limit + index + 1}</span>
        );
      },
    },
    {
      title: "Tên mẫu in",
      dataIndex: "name",
      visible: true,
      width: "25%",
    },
    {
      title: "Chi nhánh áp dụng",
      dataIndex: "store",
      visible: true,
      width: "25%",
    },
    {
      title: "Khổ in",
      dataIndex: "print_size",
      visible: true,
      width: "20%",
      className: "printSize",
      render: (value, row, index) => {
        let result = value;
        if (bootstrapReducer) {
          const selectedPrintSize = bootstrapReducer.data?.print_size.find(
            (singlePrinterSize) => {
              return singlePrinterSize.value === value;
            }
          );
          if (selectedPrintSize) {
            result = selectedPrintSize.name;
          }
        }
        return result;
      },
    },
    {
      title: "Thao tác ",
      dataIndex: "id",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        return (
          <div className="columnAction">
            <Button
              className="columnAction__singleButton columnAction__singleButton--edit"
              onClick={(e) => {
                handleEdit(e, value);
              }}
            >
              <img src={IconEdit} alt="" className="icon--normal" />
              Sửa
            </Button>
            {handlePrint && (
              <Button
                className="columnAction__singleButton columnAction__singleButton--print"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrint();
                }}
              >
                <img src={IconPrintHover} alt="" className="icon--hover" />
                In thử
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const columnFinal = () => columns.filter((item) => item.visible === true);

  const createPrinterHtml = () => {
    return (
      <Link to={`${UrlConfig.PRINTER}/create`}>
        <Button
          type="primary"
          className="ant-btn-primary"
          size="large"
          onClick={() => {}}
          icon={<PlusOutlined />}
        >
          Thêm mẫu in
        </Button>
      </Link>
    );
  };

  const handleSubmit = (values: any) => {
    const newQuery = {
      ...queryParams,
      name: values.searchInput,
      store_id: selectStoreId,
    };
    const newQueryParam = generateQuery(newQuery);
    // setSelectStoreId(null);
    setQueryParams(newQuery);
    history.replace(`${UrlConfig.PRINTER}?${newQueryParam}`);
    window.scrollTo(0, 0);
  };

  const handleSelectStore = (value: any, option: any) => {
    setSelectStoreId(value);
    // form.resetFields();
    // queryParams.name = value;
    // const newQuery = { ...queryParams, name: "", store_id: value };
    // const newQueryParam = generateQuery(newQuery);
    // setQueryParams(newQuery);
    // history.replace(`${UrlConfig.PRINTER}?${newQueryParam}`);
    // window.scrollTo(0, 0);
  };

  const renderSearch = () => {
    return (
      <div className="searchWrapper">
        <Row gutter={20}>
          <Col span={8}>
            <Form
              form={form}
              initialValues={initialFormValue}
              onFinish={handleSubmit}
              className="searchForm"
              style={{ width: "100%" }}
            >
              <div className="formInput">
                <Form.Item name="searchInput">
                  <Input placeholder="Tìm kiếm theo tên mẫu in" />
                </Form.Item>
              </div>
            </Form>
          </Col>
          <Col span={8}>
            <Select
              placeholder="Chọn chi nhánh áp dụng:"
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onSelect={handleSelectStore}
              value={selectStoreId}
              style={{ width: "100%" }}
            >
              {listStores &&
                listStores.map((single, index) => {
                  return (
                    <Select.Option value={single.id} key={index}>
                      {single.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Col>
          <Col span={8}>
            <Button
              type="primary"
              className="ant-btn-primary"
              onClick={() => {
                form.submit();
              }}
            >
              Lọc
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  useEffect(() => {
    let newParams = {
      ...queryParams,
      name: queryName || "",
      store_id: queryStoreId || "",
    };
    dispatch(
      actionFetchListPrinter(newParams, (data: PrinterResponseModel) => {
        setListPrinter(data.items);
        setTotal(data.metadata.total);
        setTableLoading(false);
      })
    );
  }, [dispatch, queryParams, queryStoreId, queryName]);

  useEffect(() => {
    if (queryName) {
      setSearchInputValue(queryName);
      form.resetFields();
    } else {
      setSearchInputValue("");
      form.resetFields();
    }
  }, [form, queryName, searchInputValue]);

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((data: StoreResponse[]) => {
        setListStores(data);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (queryStoreId) {
      let storeId = queryStoreId;
      let selectedStore = listStores.find((singleStore) => {
        return singleStore.id === +storeId;
      });
      setSelectStoreId(selectedStore?.id);
    } else {
      setSelectStoreId(null);
    }
  }, [listStores, queryStoreId]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách mẫu in"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Danh sách mẫu in",
          },
        ]}
        extra={createPrinterHtml()}
      >
        <Card style={{ padding: "35px 15px" }}>
          {renderSearch()}

          <CustomTable
            isLoading={tableLoading}
            showColumnSetting={false}
            scroll={{ x: 1080 }}
            pagination={{
              pageSize: queryParams.limit,
              total: total,
              current: queryParams.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={listPrinter}
            columns={columnFinal()}
            rowKey={(item: BasePrinterModel) => item.id}
            onRow={(record: BasePrinterModel) => {
              return {
                onClick: (event) => {
                  goToPageDetail(record.id);
                }, // click row
              };
            }}
          />
        </Card>
        <div style={{ display: "none" }}>
          <div className="printContent" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: FAKE_PRINT_CONTENT,
              }}
            ></div>
          </div>
        </div>
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingPrinter;
