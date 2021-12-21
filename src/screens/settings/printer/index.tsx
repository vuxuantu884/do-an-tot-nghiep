import {PlusOutlined} from "@ant-design/icons";
import {Button, Card, Form} from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import {PrintPermissions} from "config/permissions/setting.permisssion";
import UrlConfig from "config/url.config";
import {actionFetchListPrinter} from "domain/actions/printer/printer.action";
import purify from "dompurify";
import useAuthorization from "hook/useAuthorization";
import {RootReducerType} from "model/reducers/RootReducerType";
import {BasePrinterModel, PrinterResponseModel} from "model/response/printer.response";
import {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, useHistory, useLocation} from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import {generateQuery} from "utils/AppUtils";
import FormFilter from "./component/FormFilter";
import IconEdit from "./images/iconEdit.svg";
import IconPrintHover from "./images/iconPrintHover.svg";
import {StyledComponent} from "./styles";

const SettingPrinter: React.FC = () => {
  const FAKE_PRINT_CONTENT = "<p>This is fake print content print screen</p>";
  const printElementRef = useRef(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");

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

  //phân quyền
  const [allowReadPrint] = useAuthorization({
    acceptPermissions: [PrintPermissions.READ],
  });
  const [allowCreatePrint] = useAuthorization({
    acceptPermissions: [PrintPermissions.CREATE],
  }); 
  const query = useQuery();

  let queryName = query.get("name");
  let queryType = query.get("type");
  let queryStoreId = query.get("store_id");
  let queryPrintSize = query.get("print_size");
  let queryIsDefault = query.get("is_default");

  let [queryParams, setQueryParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 20),
    name: queryName || "",
    type: queryType || "",
    store_id: queryStoreId || "",
    print_size: queryPrintSize || "",
    is_default: queryIsDefault || "",
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      queryParams.page = page;
      queryParams.limit = size;
      let queryParam = generateQuery(queryParams);
      setQueryParams({...queryParams});
      history.replace(`${UrlConfig.PRINTER}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, queryParams]
  );

  const goToPageDetail = (id: string | number) => {
    history.push(`${UrlConfig.PRINTER}/${id}`);
  };

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
        return <span>{(queryParams.page - 1) * queryParams.limit + index + 1}</span>;
      },
    },
    {
      title: "Tên mẫu in",
      dataIndex: "name",
      visible: true,
      width: "20%",
    },
    {
      title: "Chi nhánh áp dụng",
      dataIndex: "store",
      visible: true,
      width: "20%",
    },
    {
      title: "Khổ in",
      dataIndex: "print_size",
      visible: true,
      width: "15%",
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
      // title: "Mặc định",
      title: "Áp dụng",
      dataIndex: "is_default",
      visible: true,
      width: "15%",
      render: (value, row, index) => {
        if (value) {
          return <span style={{color: "#27AE60"}}>Áp dụng</span>;
        }
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
            {allowCreatePrint ? (
              <Button
                className="columnAction__singleButton columnAction__singleButton--edit"
                onClick={(e) => {
                  handleEdit(e, value);
                }}
              >
                <img src={IconEdit} alt="" className="icon--normal" />
                Sửa
              </Button>
            ) : null}
            <Button
              className="columnAction__singleButton columnAction__singleButton--print"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Link
                to={`${UrlConfig.PRINTER}/${row.id}?action=edit&print=true`}
                target="_blank"
              >
                <img src={IconPrintHover} alt="" className="icon--hover" />
                In thử
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  const columnFinal = () => columns.filter((item) => item.visible === true);

  const createPrinterHtml = () => {
    return (
      <>
        {allowCreatePrint ? (
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
        ) : null}
      </>
    );
  };

  const handleSubmit = (values: any) => {
    const newQuery = {
      ...queryParams,
      name: values.name,
      type: values.type,
      store_id: values.store_id,
      print_size: values.print_size,
      is_default: values.is_default,
    };
    const newQueryParam = generateQuery(newQuery);
    // setSelectStoreId(null);
    setQueryParams(newQuery);
    history.replace(`${UrlConfig.PRINTER}?${newQueryParam}`);
    window.scrollTo(0, 0);
  };

  const renderSearch = () => {
    return (
      <div className="searchWrapper">
        <Card>
          <Form
            form={form}
            initialValues={initialFormValue}
            onFinish={handleSubmit}
            className="searchForm"
            style={{width: "100%"}}
          >
            <FormFilter isCanEditFormHeader={true} isPagePrinterDetail={false} />
          </Form>
          <Button
            type="primary"
            className="ant-btn-primary"
            onClick={() => {
              form.submit();
            }}
          >
            Lọc
          </Button>
        </Card>
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

  return (
    <StyledComponent>
      {allowReadPrint ? (
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
          {renderSearch()}
          <Card>
            <CustomTable
              isLoading={tableLoading}
              showColumnSetting={false}
              // scroll={{ x: 1080 }}
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
          <div style={{display: "none"}}>
            <div className="printContent" ref={printElementRef}>
              <div
                dangerouslySetInnerHTML={{
                  // __html: FAKE_PRINT_CONTENT,
                  __html: purify.sanitize(FAKE_PRINT_CONTENT),
                }}
              ></div>
            </div>
          </div>
        </ContentContainer>
      ) : (
        <NoPermission />
      )}
    </StyledComponent>
  );
};

export default SettingPrinter;
