import { Button, Card, Form, Input, Menu, Dropdown} from "antd";
import { Link, useHistory } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useDispatch} from "react-redux"; 
import { getQueryParams, useQuery } from "utils/useQuery";
import search from "assets/img/search.svg";
import { CollectionResponse,CollectionQuery } from "model/product/collection.model";
import { generateQuery } from "utils/AppUtils";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import { showSuccess } from "utils/ToastUtils";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import AuthWrapper from "component/authorization/AuthWrapper";
import useAuthorization from "hook/useAuthorization";
import "assets/css/custom-filter.scss";
import { getCollectionRequestAction, collectionDeleteAction } from "domain/actions/product/collection.action";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { ProductPermission } from "config/permissions/product.permission";
import deleteIcon from "assets/icon/deleteIcon.svg";
import editIcon from "assets/icon/edit.svg";
import threeDot from "assets/icon/three-dot.svg";
import { PageResponse } from "model/base/base-metadata.response";
import CustomPagination from "component/table/CustomPagination";
import TextEllipsis from "component/table/DescriptionColumn";

const updateCollectionPermission = [ProductPermission.collections_update];
const deleteCollectionPermission = [ProductPermission.collections_delete];

const { Item } = Form;
 
const Collection = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let getParams: CollectionQuery = getQueryParams(query);
  if (!getParams.goods) {
    getParams.goods = undefined;
  }
  const [params, setPrams] = useState<CollectionQuery>(getParams);
  const [data, setData] = useState<PageResponse<Array<CollectionResponse>>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [collectionId, setCollectionId] = useState<number>(0); 

  const RenderActionColumn = (value: any, row: CollectionResponse, index: number) => {
    const [allowUpdateCollection] = useAuthorization({
      acceptPermissions: updateCollectionPermission,
      not: false,
    });

    const [allowDeleteCollection] = useAuthorization({
      acceptPermissions: deleteCollectionPermission,
      not: false,
    });

    const isShowAction = allowUpdateCollection || allowDeleteCollection;
    
    const menu = (
      <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {allowUpdateCollection &&
          <Menu.Item key="1">
            <Button
              icon={<img alt="" style={{ marginRight: 12 }} src={editIcon} />}
              type="text"
              className=""
              style={{
                paddingLeft: 24,
                background: "transparent",
                border: "none",
              }}
              onClick={() => {
                history.push(`${UrlConfig.COLLECTIONS}/${row.id}`);
              }}
            >
              Chỉnh sửa
            </Button>
          </Menu.Item>
        }
        
        {allowDeleteCollection &&
          <Menu.Item key="2">
            <Button
              icon={<img alt="" style={{ marginRight: 12 }} src={deleteIcon} />}
              type="text"
              className=""
              style={{
                paddingLeft: 24,
                background: "transparent",
                border: "none",
                color: "red",
              }}
              onClick={() => {
                setCollectionId(row.id);
                setConfirmDelete(true)
              }}
            >
              Xóa
            </Button>
          </Menu.Item>
        }
      </Menu>
    );

    return (
      <>
        {isShowAction &&
          <Dropdown
            overlay={menu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              className="p-0 ant-btn-custom"
              icon={<img src={threeDot} alt=""></img>}
            ></Button>
          </Dropdown>
        }
      </>
    );
  }

  const columns: Array<ICustomTableColumType<CollectionResponse>> = [
    {
      title: "STT",
      key: "index",
      render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
      visible: true, 
      width: 60,
      align: "center",
    },
    {
      title: "ID",
      width: 130,
      dataIndex: "code",
      render: (text: string, item: CollectionResponse) => {
        return <Link to={`${UrlConfig.COLLECTIONS}/${item.id}`}>{text}</Link>;
      },
    }, 
    {
      title: "Nhóm hàng",
      dataIndex: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 350,
      render: (value)=>{
        return <TextEllipsis value={value} />
      }
    },
    {
      title: "Người tạo",
      width: 200,
      render: (value: string,item: CollectionResponse) => {
        return (
          <div>
             <Link to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}> 
                  {item.created_by} - {item.created_name}
             </Link>  
          </div>
        );
      },
    }, 
    {
      title: "Ngày tạo",
      width: 100,
      dataIndex: "created_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
    },
    {
      title: "",
      visible: true,
      width: "5%",
      className: "saleorder-product-card-action ",
      render: (value, row, index) => RenderActionColumn(value, row, index)
    },
  ];
  const onFinish = useCallback(
    (values: CollectionQuery) => {
      let query = generateQuery({...values});

      const newValues = {...values, condition: values.condition?.trim()};
      
      setPrams({ ...newValues });
      return history.replace(`${UrlConfig.COLLECTIONS}?${query}`);
    },
    [history]
  );

  const onGetSuccess = useCallback((results: PageResponse<Array<CollectionResponse>>) => {
    setLoading(false);
    
    if (results && results.items) {
      setData(results);
    }
  }, []);

  const onDeleteSuccess = useCallback(() => {
    dispatch(hideLoading());
    showSuccess("Xóa nhóm hàng thành công");
    dispatch(getCollectionRequestAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      
      setPrams({...params});
    },
    [params]
  );

  useEffect(() => {
    setLoading(true);
    dispatch(getCollectionRequestAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);
  return (
    <ContentContainer
      title="Quản lý nhóm hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Nhóm hàng",
          path: `${UrlConfig.COLLECTIONS}`,
        },
      ]}
      extra={
        <AuthWrapper acceptPermissions={[ProductPermission.collections_create]}>
          <ButtonCreate child="Thêm nhóm hàng" path={`${UrlConfig.COLLECTIONS}/create`} />
        </AuthWrapper>
      }
    >
      <Card>
        <div className="custom-filter" style={{paddingBottom: 20}}>
            <Form onFinish={onFinish} layout="inline" initialValues={params}>
              <Item name="condition" style={{flex: 'auto'}} className="input-search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tìm kiếm theo ID/Tên nhóm hàng"
                />
              </Item>
              <Item>
                <Button htmlType="submit" type="primary">
                  Lọc
                </Button>
              </Item> 
            </Form>
        </div> 
        <CustomTable
          isRowSelection={false}
          isLoading={loading}
          pagination={false}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: CollectionResponse) => item.id}
        />
         <CustomPagination
          pagination={{
            showSizeChanger: true,
            pageSize: data.metadata.limit,
            current: data.metadata.page,
            total: data.metadata.total,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
        />
      </Card>
      <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={() => {
          setConfirmDelete(false);
          dispatch(showLoading());
          dispatch(collectionDeleteAction(collectionId, onDeleteSuccess));
        }}
        title="Bạn chắc chắn xóa nhóm hàng?" 
        visible={isConfirmDelete}
      />
    </ContentContainer>
  );
};

export default Collection;
