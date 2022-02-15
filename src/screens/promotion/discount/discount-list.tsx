import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Menu, Row } from "antd";
import threeDot from "assets/icon/three-dot.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import { MenuAction } from "component/table/ActionButton";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import useAuthorization from "hook/useAuthorization";
import { PriceRule } from "model/promotion/price-rules.model";
import React, { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { FiCheckCircle, RiDeleteBin2Fill } from "react-icons/all";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { OFFSET_HEADER_UNDER_NAVBAR, PROMO_TYPE } from "utils/Constants";
import ContentContainer from "../../../component/container/content.container";
import CustomTable, { ICustomTableColumType } from "../../../component/table/CustomTable";
import UrlConfig from "../../../config/url.config";
import { bulkDisablePriceRulesAction, bulkEnablePriceRulesAction, getListDiscountAction } from "../../../domain/actions/promotion/discount/discount.action";
import { PageResponse } from "../../../model/base/base-metadata.response";
import { DiscountSearchQuery } from "../../../model/query/discount.query";
import { showError, showSuccess } from "../../../utils/ToastUtils";
import { getQueryParams, useQuery } from "../../../utils/useQuery";
import { ACTIONS_DISCOUNT, DISCOUNT_STATUS } from "../constants";
import DatePromotionColumn from "../shared/date-column";
import DiscountFilter from "./components/DiscountFilter";
import { DiscountStyled } from "./discount-style";
import "./discount-style.ts";
const DiscountPage = () => {

  const initQuery: DiscountSearchQuery = {
    limit: 30,
    page: 1,
    type: PROMO_TYPE.AUTOMATIC,
    request: "",
    from_created_date: "",
    to_created_date: "",
    state: null,
    applied_shop: "",
    applied_source: "",
    customer_category: "",
    discount_method: "",
  };
  const dispatch = useDispatch();
  const query = useQuery();

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [discounts, setDiscounts] = useState<PageResponse<PriceRule>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  let dataQuery: DiscountSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [params, setParams] = useState<DiscountSearchQuery>(dataQuery);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);

  //phân quyền
  const [allowCancelPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CANCEL],
  });
  const [allowUpdateDiscount] = useAuthorization({acceptPermissions:[PromoPermistion.UPDATE]})

  useEffect(() => {
    setTableLoading(true);
    dispatch(getListDiscountAction(params, (result) => {
      setTableLoading(false);
      if (result)
        setDiscounts(result)
    }));
  }, [dispatch, params]);


  const actionFilter: Array<MenuAction> = useMemo(() => {
    if (selectedRowKey.length < 1) {
      return ACTIONS_DISCOUNT.map((e) => {
        e.disabled = true;
        return e;
      });
    } else if (selectedRowKey.length > 0 && !allowCancelPromoCode) {
      return ACTIONS_DISCOUNT.map((e) => {
        e.disabled = false;
        return e;
      }).filter((e) => e.id !== 1 && e.id !== 2)
    } else if (selectedRowKey.length > 0) {
      return ACTIONS_DISCOUNT.map((e) => {
        e.disabled = false;
        return e;
      })
    }
    return ACTIONS_DISCOUNT;

  }, [allowCancelPromoCode, selectedRowKey]);

  function onChangePriceRuleStatus(numberOfDisabled: number): void {
    if (numberOfDisabled) {
      showSuccess(`Cập nhật chiết khấu thành công`);
      dispatch(getListDiscountAction(params, setDiscounts));
    } else {
      showError(`Cập nhật chiết khấu thất bại`);
    }
    setTableLoading(false);
  }

  const handleDeactivatePriceRule = (idNumber: number) => {
    setTableLoading(true);

    dispatch(
      bulkDisablePriceRulesAction(
        { ids: [idNumber] },
        (numberOfDisabled: number) => onChangePriceRuleStatus(numberOfDisabled)
      )
    );
  };

  const handleActivatePriceRule = (idNumber: number) => {
    setTableLoading(true);
     
    dispatch(
      bulkEnablePriceRulesAction(
        { ids: [idNumber] },
        (numberOfDisabled: number) => onChangePriceRuleStatus(numberOfDisabled)
      )
    );
  };

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      render: (value: any, item: any, index: number) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${value.id}`}
          style={{ color: "#2A2A86", fontWeight: 500 }}
        >
          {value.code}
        </Link>
      ),
    },
    {
      title: "Tên chương trình",
      visible: true,
      dataIndex: "title",
    },
    {
      title: "Ưu tiên",
      visible: true,
      dataIndex: "priority",
      align: "center",

      render: (value: any) => (
        <Row justify="center">
          <Col>
            <div
              style={{
                background: "rgba(42, 42, 134, 0.1)",
                borderRadius: "5px",
                color: "#2A2A86",
                padding: "5px 10px",
                width: "fit-content",
              }}
            >
              {value}
            </div>
          </Col>
        </Row>
      ),
    },
    {
      title: "Thời gian",
      visible: true,
      align: "center",
      render: (value: any, item: any) => (
        <DatePromotionColumn startDate={item.starts_date} endDate={item.ends_date}/>
      ),
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_name",
      align: "center",
    },
    {
      title: "Trạng thái",
      visible: true,
      dataIndex: "state",
      align: "center",
      render: (state: string) => {
        const StatusTag: ReactNode = DISCOUNT_STATUS.find((e) => e.code === state)?.Component ?? <Fragment />;
        return StatusTag;
      },
    },
    {
      visible: true,
      dataIndex: "id",
      align: "center",
      render: (id: number, item: any) => (
        <Dropdown.Button
        disabled={!allowUpdateDiscount}
          overlay={
            <Menu>
              <Menu.Item icon={<EditOutlined />} key={1}>
                <Link to={`discounts/${id}/update`}>Chỉnh sửa</Link>
              </Menu.Item>
              {item.state ==="DISABLED"?(<Menu.Item
                key={3}
                icon={<FiCheckCircle />}
                onClick={() => {
                  handleActivatePriceRule(id);
                }}
              >
                Kích hoạt
              </Menu.Item>):(
              <Menu.Item
                key={3}
                icon={<RiDeleteBin2Fill />}
                onClick={() => {
                  handleDeactivatePriceRule(id);
                }}
              >
                Tạm ngừng
              </Menu.Item>)}
            </Menu>
          }
          icon={<img src={threeDot} alt="" style={{ verticalAlign: 'super' }} />}
        />
      ),
    },
  ];

  const onPageChange = (page: number, limit?: number) => {
    setParams({ ...params, page, limit });
  };

  const onFilter = (values: DiscountSearchQuery | Object) => {
    let newParams = { ...params, ...values, page: 1 };
    setParams({ ...newParams });
  }

  const onMenuClick =
    (index: number) => {
      setTableLoading(true);
      const body = { ids: selectedRowKey };
      switch (index) {
        case 1:
          dispatch(bulkEnablePriceRulesAction(body, (numberOfActived: number) => {
            if (typeof numberOfActived === "number") {
              showSuccess(`Đã kích hoạt thành công ${numberOfActived}/${selectedRowKey.length} chương trình`);
              dispatch(getListDiscountAction(params, setDiscounts));
            }
          }
          ))
          setTableLoading(false);
          break;
        case 2:
          dispatch(bulkDisablePriceRulesAction(body, (numberOfActived: number) => {
            if (typeof numberOfActived === "number") {
              showSuccess(`Đã tạm ngưng thành công ${numberOfActived}/${selectedRowKey.length} chương trình`);
              dispatch(getListDiscountAction(params, setDiscounts));
            }
          }
          ))
          setTableLoading(false);
          break;
        case 3:
          break;
      }
    };

  return (
    <ContentContainer
      title="Chiết khấu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
        {
          name: "Chiết khấu",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
      ]}
      extra={
        <AuthWrapper acceptPermissions={[PromoPermistion.CREATE]}>
          <Link to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`}>
            <Button
              className="ant-btn-outline ant-btn-primary"
              size="large"
              icon={<PlusOutlined />}
            >
              Tạo mới khuyến mại
            </Button>
          </Link></AuthWrapper>

      }
    >
      <DiscountStyled>
      <Card
        title={"Danh sách chiết khấu"}
      >
        <DiscountFilter
          onMenuClick={onMenuClick}
          params={params}
          actions={actionFilter}
          onFilter={onFilter}
        />
        <CustomTable
          selectedRowKey={selectedRowKey}
          onChangeRowKey={(rowKey) => setSelectedRowKey(rowKey)}
          isRowSelection
          isLoading={tableLoading}
          sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
          pagination={{
            pageSize: discounts?.metadata.limit || 0,
            total: discounts?.metadata.total || 0,
            current: discounts?.metadata.page,
            showSizeChanger: true, 
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={discounts?.items}
          columns={columns}
          rowKey={(item: any) => item.id}
        />

      </Card>
      </DiscountStyled> 
    </ContentContainer>


  );
};

export default DiscountPage;


