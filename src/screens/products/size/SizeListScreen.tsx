import { Button, Card, Form, Input } from "antd";
import { MenuAction } from "component/table/ActionButton";
import search from "assets/img/search.svg";
import CustomTable from "component/table/CustomTable";
import {
  SizeResponse,
  SizeQuery,
  SizeDetail,
  SizeCreateRequest,
  SizeUpdateRequest,
} from "model/product/size.model";
import { Link, useHistory } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageResponse } from "model/base/base-metadata.response";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import {
  sizeCreateAction,
  sizeDeleteManyAction,
  sizeDeleteOneAction,
  sizeSearchAction,
  sizeUpdateAction,
} from "domain/actions/product/size.action";
import UrlConfig from "config/url.config";
import { showSuccess, showWarning } from "utils/ToastUtils";
import CustomFilter from "component/table/custom.filter";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ContentContainer from "component/container/content.container";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import useAuthorization from "hook/useAuthorization";
import { ProductPermission } from "config/permissions/product.permission";
import AuthWrapper from "component/authorization/AuthWrapper";
import "assets/css/custom-filter.scss";
import { modalActionType } from "model/modal/modal.model";
import FormSize from "./conponents";
import CustomModal from "component/modal/CustomModal";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import "./styles.scss"

const actionsDefault: Array<MenuAction> = [
  {
    id: 2,
    name: "Xóa",
    icon: <DeleteOutlined />,
  },
];

const SizeListScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const [selected, setSelected] = useState<Array<SizeResponse>>([]);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const dispatch = useDispatch();
  const [isShowModalDetail, setIsShowModalDetail] = useState(false);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [sizeDetail, setSizeDetail] = useState<SizeDetail>();

  const [params, setPrams] = useState<SizeQuery>({
    ...getQueryParams(query),
  });

  const [data, setData] = useState<PageResponse<SizeResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const columns = [
    {
      title: "Kích cỡ",
      dataIndex: "code",
    },
    {
      title: "Người tạo",
      render: (item: SizeResponse) => {
        return item.created_name ? (
          <div>
            <Link
              target="_blank"
              className="product-size-creator"
              to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}
            >
              {item.created_name}
            </Link>
          </div>
        ) : (
          "---"
        );
      },
    },
  ];

  const changePage = useCallback(
    (page, size) => {
      const newParams = {
        ...params,
        code: params.code?.trim(),
        page: page,
        limit: size,
      };
      let queryParam = generateQuery(params);

      setPrams({ ...newParams });
      history.replace(`${UrlConfig.SIZES}?${queryParam}`);
    },
    [history, params],
  );

  const changeSelectedRows = useCallback((selectedRow: Array<SizeResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  const searchProductSize = useCallback(
    (values: SizeQuery) => {
      const query = generateQuery(values);

      values = { ...values, code: values.code?.trim() };
      setPrams({ ...values });
      return history.replace(`${UrlConfig.SIZES}?${query}`);
    },
    [history],
  );

  const [canUpdateSizes] = useAuthorization({
    acceptPermissions: [ProductPermission.sizes_update],
  });

  const [canDeleteSizes] = useAuthorization({
    acceptPermissions: [ProductPermission.sizes_delete],
  });

  const menuFilter = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === 1) {
        return selected.length === 1 && canUpdateSizes;
      }
      if (item.id === 2) {
        return canDeleteSizes;
      }
      return true;
    });
  }, [selected, canUpdateSizes, canDeleteSizes]);

  const searchSizeCallback = useCallback((listResult: PageResponse<SizeResponse>) => {
    setIsLoadingTable(false);
    setData(listResult);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    showSuccess("Xóa kích cỡ thành công");
    setSelected([...selected]);
    setIsLoadingTable(true);
    dispatch(sizeSearchAction(params, searchSizeCallback));
  }, [dispatch, params, searchSizeCallback, selected]);

  const deleteProductSize = useCallback(() => {
    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(sizeDeleteOneAction(id, onDeleteSuccess));
      return;
    }
    let ids: Array<number> = [];
    selected.forEach((a) => ids.push(a.id));
    dispatch(sizeDeleteManyAction(ids, onDeleteSuccess));
  }, [dispatch, onDeleteSuccess, selected]);

  const onUpdate = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn phần từ cần xóa");
      return;
    }
    if (selected.length === 1) {
      let id = selected[0].id;
      history.push(`${UrlConfig.SIZES}/${id}`);
      return;
    }
  }, [history, selected]);

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          onUpdate();
          break;
        case 2:
          if (selected.length === 0) {
            showWarning("Vui lòng chọn kích cỡ cần xóa");
            return;
          }
          setIsConfirmDelete(true);
          break;
      }
    },
    [onUpdate, selected],
  );

  const isFirstLoad = useRef(true);

  const actionsForm = {
    Create: useCallback(
      (values: SizeCreateRequest) => {
        setIsShowModalDetail(false);
        dispatch(
          sizeCreateAction(values, () => {
            showSuccess("Thêm kích cỡ thành công.");
            dispatch(sizeSearchAction(params, searchSizeCallback));
          }),
        );
      },
      [dispatch, params, searchSizeCallback],
    ),
    Update: useCallback(
      (data: SizeUpdateRequest) => {
        if (sizeDetail && sizeDetail.id) {
          setIsShowModalDetail(false);
          dispatch(
            sizeUpdateAction(sizeDetail.id, data, () => {
              showSuccess("Cập nhật kích cỡ thành công.");
              dispatch(sizeSearchAction(params, searchSizeCallback));
            }),
          );
        }
      },
      [dispatch, params, sizeDetail, searchSizeCallback],
    ),
  };

  useEffect(() => {
    setIsLoadingTable(true);
    isFirstLoad.current = false;
    dispatch(sizeSearchAction(params, searchSizeCallback));
  }, [dispatch, history, params, searchSizeCallback]);

  return (
    <ContentContainer
      title="Quản lý kích cỡ"
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
          name: "Kích cỡ",
          path: `${UrlConfig.SIZES}`,
        },
      ]}
      extra={
        <AuthWrapper acceptPermissions={[ProductPermission.sizes_create]}>
          <Button
            className="ant-btn-primary"
            size="large"
            icon={<PlusOutlined className="ant-btn-primary-icon"/>}
            onClick={() => {
              setModalAction("create");
              setIsShowModalDetail(true);
            }}
          >
            Thêm kích cỡ
          </Button>
        </AuthWrapper>
      }
    >
      <Card>
        <div className="custom-filter">
          <CustomFilter menu={menuFilter} onMenuClick={onMenuClick}>
            <Form layout="inline" initialValues={params} onFinish={searchProductSize}>
              <Form.Item name="code" className="input-search">
                <Input prefix={<img src={search} alt="" />} placeholder="Kích cỡ" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Form.Item>
            </Form>
          </CustomFilter>
        </div>
        <CustomTable
          className="tr-hover"
          isRowSelection
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
          isLoading={isLoadingTable}
          dataSource={data.items}
          columns={columns}
          onSelectedChange={changeSelectedRows}
          rowKey={(item: SizeResponse) => item.id}
          onRow={(item: SizeResponse) => {
            return {
              onClick: () => {
                setModalAction("onlyedit");
                setSizeDetail(item);
                setIsShowModalDetail(true);
              },
            };
          }}
        />
        <ModalDeleteConfirm
          onCancel={() => setIsConfirmDelete(false)}
          onOk={() => {
            setIsConfirmDelete(false);
            deleteProductSize();
          }}
          title="Bạn chắc chắn xóa kích cỡ ?"
          subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
          visible={isConfirmDelete}
        />
      </Card>
      <CustomModal
        createText="Tạo kích thước"
        updateText="Lưu lại"
        visible={isShowModalDetail}
        onCreate={(formValues: SizeCreateRequest) => actionsForm.Create(formValues)}
        onEdit={(formValues: SizeUpdateRequest) => actionsForm.Update(formValues)}
        onDelete={() => {}}
        onCancel={() => setIsShowModalDetail(false)}
        modalAction={modalAction}
        componentForm={FormSize}
        formItem={sizeDetail}
        modalTypeText="Kích cỡ"
      />
    </ContentContainer>
  );
};

export default SizeListScreen;
