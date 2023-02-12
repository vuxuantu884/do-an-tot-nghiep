import { Button, Card, Form, Input, Menu, Dropdown } from "antd";
import { Link, useHistory } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getQueryParams, useQuery } from "utils/useQuery";
import search from "assets/img/search.svg";
import { CollectionResponse, CollectionQuery } from "model/product/collection.model";
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
import {
  getCollectionRequestAction,
  collectionDeleteAction,
} from "domain/actions/product/collection.action";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { ProductPermission } from "config/permissions/product.permission";
import deleteIcon from "assets/icon/deleteIcon.svg";
import editIcon from "assets/icon/edit.svg";
import threeDot from "assets/icon/three-dot.svg";
import { PageResponse } from "model/base/base-metadata.response";
import TextEllipsis from "component/table/TextEllipsis";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

const updateCollectionPermission = [ProductPermission.collections_update];
const deleteCollectionPermission = [ProductPermission.collections_delete];

const { Item } = Form;

const CURRENT_PAGE = 1;
const PAGE_LIMIT = 30;

const Collection = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let getParams: CollectionQuery = getQueryParams(query);
  if (!getParams.goods) {
    getParams.goods = undefined;
  }
  const [params, setPrams] = useState<CollectionQuery>(getParams);
  const [data, setData] = useState<PageResponse<CollectionResponse>>({
    metadata: {
      page: CURRENT_PAGE,
      limit: PAGE_LIMIT,
      total: 0,
    },
    items: [],
  });
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [collectionId, setCollectionId] = useState<number>(0);

  const RenderActionColumn = (value: any, row: CollectionResponse) => {
    const [canUpdateCollection] = useAuthorization({
      acceptPermissions: updateCollectionPermission,
      not: false,
    });

    const [canDeleteCollection] = useAuthorization({
      acceptPermissions: deleteCollectionPermission,
      not: false,
    });

    const isShowAction = canUpdateCollection || canDeleteCollection;

    const menu = (
      <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {canUpdateCollection && (
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
        )}

        {canDeleteCollection && (
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
                setConfirmDelete(true);
              }}
            >
              Xóa
            </Button>
          </Menu.Item>
        )}
      </Menu>
    );

    return (
      <>
        {isShowAction && (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              className="p-0 ant-btn-custom"
              icon={<img src={threeDot} alt=""></img>}
            ></Button>
          </Dropdown>
        )}
      </>
    );
  };

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
      render: (value) => {
        return <TextEllipsis value={value} />;
      },
    },
    {
      title: "Người tạo",
      width: 200,
      render: (value: string, item: CollectionResponse) => {
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
      render: (value, row) => RenderActionColumn(value, row),
    },
  ];
  const onFinish = useCallback(
    (values: CollectionQuery) => {
      let query = generateQuery({ ...values });

      const newValues = { ...values, condition: values.condition?.trim() };

      setPrams({ ...newValues });
      return history.replace(`${UrlConfig.COLLECTIONS}?${query}`);
    },
    [history],
  );

  const onGetSuccess = useCallback((results: PageResponse<CollectionResponse>) => {
    setIsLoading(false);

    if (results && results.items) {
      setData(results);
    }
  }, []);

  const onDeleteSuccess = useCallback(() => {
    dispatch(hideLoading());
    showSuccess("Xóa nhóm hàng thành công");
    dispatch(getCollectionRequestAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);

  const changePage = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;

      history.push({ search: `?page=${page}&limit=${size}` });

      setPrams({ ...params });
    },
    [params, history],
  );

  useEffect(() => {
    setIsLoading(true);
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
        <div className="custom-filter" style={{ paddingBottom: 20 }}>
          <Form onFinish={onFinish} layout="inline" initialValues={params}>
            <Item name="condition" style={{ flex: "auto" }} className="input-search">
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
          isLoading={isLoading}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: CollectionResponse) => item.id}
          isShowPaginationAtHeader
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: changePage,
            onShowSizeChange: changePage,
          }}
          sticky={{ offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
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
