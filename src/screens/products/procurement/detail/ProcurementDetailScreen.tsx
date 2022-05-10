import { Button, Card, Col, Divider, Image, Modal, Row, Table, Tabs, Typography } from 'antd';
import BaseTagStatus from 'component/base/BaseTagStatus';
import BottomBarContainer from 'component/container/bottom-bar.container';
import ContentContainer from 'component/container/content.container';
import RenderTabBar from 'component/table/StickyTabBar';
import UrlConfig, { BASE_NAME_ROUTER, PurchaseOrderTabUrl } from 'config/url.config';
import { isEmpty } from 'lodash';
import { PurchaseOrder } from 'model/purchase-order/purchase-order.model';
import { POProcumentField, POProcumentLineItemField, PurchaseProcument, PurchaseProcumentLineItem } from 'model/purchase-order/purchase-procument';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom'
import PurchaseOrderHistory from 'screens/purchase-order/tab/PurchaseOrderHistory';
import { getPurchaseOrderApi } from 'service/purchase-order/purchase-order.service';
import { callApiNative } from 'utils/ApiUtils';
import { OFFSET_HEADER_TABLE, ProcurementStatus, ProcurementStatusName } from 'utils/Constants';
import { ConvertUtcToLocalDate } from 'utils/DateUtils';
import { StyledComponent } from '../styles';
import ImageProduct from 'screens/products/product/component/image-product.component';
import { POUtils } from 'utils/POUtils';
import { formatCurrency } from 'utils/AppUtils';
import { DeleteOutlined, PhoneOutlined } from '@ant-design/icons';
import EditNote from 'screens/order-online/component/edit-note';
import { primaryColor } from 'utils/global-styles/variables';
import AuthWrapper from 'component/authorization/AuthWrapper';
import { PurchaseOrderPermission } from 'config/permissions/purchase-order.permission';
import { PoProcumentDeleteAction } from 'domain/actions/po/po-procument.action';
import { showSuccess } from 'utils/ToastUtils';
import { updatePurchaseProcumentNoteService } from 'service/purchase-order/purchase-procument.service';

type ProcurementParam = {
  id: string;
  prID: string;
};

const ProcurementDetailScreen: React.FC = () => {
  const { id: poID, prID } = useParams<ProcurementParam>()
  const [poData, setPOData] = useState<PurchaseOrder>()
  const [procurementData, setProcurementData] = useState<PurchaseProcument>()
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isError, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(PurchaseOrderTabUrl.INVENTORY);
  const [visibleDelete, setVisibleDelete] = useState<boolean>(false);
  const history = useHistory()
  const dispatch = useDispatch()
  const { TabPane } = Tabs
  const { Text } = Typography;

  const getPODetail = useCallback(async () => {
    const res: PurchaseOrder = await callApiNative({ isShowError: true, isShowLoading: true }, dispatch, getPurchaseOrderApi, poID)
    if (res && !isEmpty(res.procurements)) {
      setPOData(res)
      setLoading(false)
      const detailProcurement = res.procurements.find((item: PurchaseProcument) => item.id === parseInt(prID))
      if (!isEmpty(detailProcurement)) {
        setProcurementData(detailProcurement)
      } else {
        setError(true)
      }
    } else {
      setError(true)
    }
  }, [dispatch, poID, prID])

  useEffect(() => {
    if (poID && prID) {
      setLoading(true)
      getPODetail()
    } else {
      setError(true)
    }
  }, [dispatch, getPODetail, poID, prID])

  const onChangeActive = (active: string) => {
    setActiveTab(active);
  }

  const onUpdateReceivedProcurement = async (note: string) => {
    if (poID && procurementData && prID) {
      const data: PurchaseProcument = { ...procurementData, [POProcumentField.note]: note }
      const res = await callApiNative({ isShowError: true }, dispatch, updatePurchaseProcumentNoteService, parseInt(poID), parseInt(prID), data)
      if (res) {
        getPODetail()
        showSuccess('Cập nhật thành công')
      }
    }
  }

  const renderTitle = () => {
    return (activeTab === PurchaseOrderTabUrl.INVENTORY ? <StyledComponent>
      <span>Phiếu nhập kho</span>{" "}
      <span>
        {procurementData?.code} - {procurementData?.status === ProcurementStatus.cancelled ? ProcurementStatusName[`${procurementData?.status}`] :
          <BaseTagStatus color={
            procurementData?.status === ProcurementStatus.draft ? "gray"
              : procurementData?.status === ProcurementStatus.not_received ? "blue"
                : procurementData?.status === ProcurementStatus.received ? "green"
                  : undefined
          }>{ProcurementStatusName[`${procurementData?.status}`]}</BaseTagStatus>}
      </span>
    </StyledComponent> : (
      <div>
        {"Chi tiết log phiếu nhập kho "}
        <span style={{ color: "#2A2A86" }}>{procurementData?.code}</span>
      </div>
    ))
  }

  const confirmDeletePhrase: string = useMemo(() => {
    if (!procurementData) return "";
    let prefix = "phiếu nháp";
    if (procurementData.status === ProcurementStatus.not_received) prefix = "phiếu duyệt";
    else if (procurementData.status === ProcurementStatus.received) prefix = "phiếu nhập kho";
    return `Bạn chắc chắn huỷ ${prefix} ${procurementData?.code}?`;
  }, [procurementData]);

  const onDeleteProcumentCallback = (result: any) => {
    if (result !== null) {
      showSuccess("Huỷ phiếu thành công");
      history.push(`${UrlConfig.PROCUREMENT}`)
    }
  }

  const onDeleteProcument = (value: PurchaseProcument) => {
    if (poID && value.id) {
      dispatch(
        PoProcumentDeleteAction(parseInt(poID), value.id, onDeleteProcumentCallback)
      );
    }
  }

  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoading}
      title={procurementData?.code || ""}
      breadcrumb={[
        {
          name: "Kho hàng",
        },
        {
          name: "Nhập kho",
          path: `${UrlConfig.PROCUREMENT}`,
        },
        {
          name: `${poData?.code || ""}`,
          path: `${UrlConfig.PURCHASE_ORDERS}/${poData?.id}`,
        },
        {
          name: `Phiếu nhập kho`,
        },
      ]}
    >
      <Card title={renderTitle()}>

        <Tabs
          style={{ overflow: "initial", marginTop: "-24px" }}
          activeKey={activeTab}
          onChange={(active) => onChangeActive(active)}
          renderTabBar={RenderTabBar}
        >
          <TabPane tab="Tồn kho" key={PurchaseOrderTabUrl.INVENTORY}>
            <div style={{ marginTop: 10, marginBottom: 15 }}>
              <Row gutter={{ md: 24, lg: 32 }}>
                <Col span={4}>
                  <div>Mã phiếu nhập kho:</div>
                  <div >
                    <Text style={{ color: "#2A2A86", fontSize: 16 }} strong>{procurementData?.code}</Text>
                  </div>
                </Col>
                <Col span={4}>
                  <div>Mã tham chiếu:</div>
                  <div><Text strong>{poData?.reference}</Text></div>
                </Col>
                <Col span={5}>
                  <div>ID đơn đặt hàng:</div>
                  <div>
                    <Link to={"#"} onClick={() => {
                      const url = `${BASE_NAME_ROUTER}${UrlConfig.PURCHASE_ORDERS}/${poData?.id}`
                      const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
                      if (newWindow) newWindow.opener = null
                    }}>
                      {poData?.code}
                    </Link>
                  </div>
                </Col>
                <Col span={6}><div>Nhà cung cấp:</div>
                  <div>
                    <Link to={`${UrlConfig.SUPPLIERS}/${poData?.supplier_id}`} >{poData?.supplier ?? poData?.supplier_address.name}</Link></div>
                </Col>
                <Col span={5}><PhoneOutlined />{" "}<Text>{poData?.phone ?? poData?.supplier_address?.phone}</Text></Col>
              </Row>
              <Divider />
              <Row>
                <Col span={8}>
                  Kho nhận hàng: {" "}
                  <Text strong>{procurementData?.store}</Text>
                </Col>
                <Col span={8}>
                  Ngày nhận hàng: {" "}
                  <Text strong>{ConvertUtcToLocalDate(procurementData?.expect_receipt_date)}</Text>
                </Col>
                <Col span={8}>
                  {procurementData &&
                    <EditNote
                      note={procurementData.note}
                      title="Ghi chú: "
                      color={primaryColor}
                      onOk={(newNote) => {
                        onUpdateReceivedProcurement(newNote)
                        // editNote(newNote, "customer_note", record.id, record);
                      }}
                    // isDisable={record.status === OrderStatus.FINISHED}
                    />}
                </Col>
              </Row>
            </div>
            <Table
              className="product-table"
              rowKey={(record: PurchaseProcumentLineItem) =>
                record.line_item_id
              }
              rowClassName="product-table-row"
              dataSource={procurementData?.procurement_items}
              tableLayout="fixed"
              sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
              pagination={false}
              columns={[
                {
                  title: "STT",
                  align: "center",
                  width: 60,
                  render: (value, record, index) => index + 1,
                },
                {
                  title: "Ảnh",
                  align: "center",
                  width: 60,
                  dataIndex: POProcumentLineItemField.variant_image,
                  render: (value: string) => {
                    return (
                      <>
                        {value ? <Image width={40} height={40} placeholder="Xem" src={value ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={value} />}
                      </>
                    );
                  },
                },
                {
                  title: "Sản phẩm",
                  width: 150,
                  className: "ant-col-info",
                  dataIndex: POProcumentLineItemField.variant,
                  render: (
                    value: string,
                    item: PurchaseProcumentLineItem,
                    index: number
                  ) => (
                    <div>
                      <div>
                        <div className="product-item-sku">{item.sku}</div>
                        <div className="product-item-name text-truncate-1">
                          <div className="product-item-name-detail">
                            {value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: (
                    <div>
                      SL Đặt hàng
                      <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                        ({formatCurrency(POUtils.totalOrderQuantityProcument(procurementData?.procurement_items ?? []), ".")})
                      </div>
                    </div>
                  ),
                  width: 100,
                  align: "center",
                  dataIndex: POProcumentLineItemField.ordered_quantity,
                  render: (value, item, index) => (
                    <div >{formatCurrency(value, ".")}</div>
                  ),
                },
                {
                  title: (
                    <div>
                      SL nhận được duyệt
                      <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                        ({formatCurrency(POUtils.totalQuantityProcument(procurementData?.procurement_items ?? []), ".")})
                      </div>
                    </div>
                  ),
                  align: "center",
                  width: 100,
                  dataIndex: POProcumentLineItemField.quantity,
                  render: (value, item, index) => (
                    <div>{value}</div>
                  ),
                },
                {
                  title: (
                    <div>
                      SL thực nhận
                      <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                        ({formatCurrency(POUtils.totalRealQuantityProcument(procurementData?.procurement_items ?? []), ".")})
                      </div>
                    </div>
                  ),
                  align: "center",
                  width: 100,
                  dataIndex: POProcumentLineItemField.real_quantity,
                  render: (value, item, index) => {
                    return <div>{value}</div>
                  },
                },
              ]}
              summary={(data) => {
                let ordered_quantity = 0;
                let quantity = 0;
                let real_quantity = 0;
                data.forEach((item) => {
                  ordered_quantity = ordered_quantity + item.ordered_quantity;
                  quantity = quantity + item.quantity;
                  real_quantity = real_quantity + item.real_quantity;
                });
                return (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell align="center" colSpan={3} index={0}>
                        <div style={{ fontWeight: 700 }}>Tổng</div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center" index={1}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(ordered_quantity, ".")}
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center" index={2}>
                        <div style={{ fontWeight: 700 }}>{formatCurrency(quantity, ".")}</div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center" index={3}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(real_quantity, ".")}
                        </div>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </TabPane>
          <TabPane tab="Lịch sử thao tác" key={PurchaseOrderTabUrl.HISTORY}>
            <PurchaseOrderHistory poData={poData} procumentCode={procurementData?.code} />
          </TabPane>
        </Tabs>
      </Card>
      <BottomBarContainer
        leftComponent={
          <div
          >
            {poData && procurementData?.status !== ProcurementStatus.cancelled && (
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.procurements_delete]}>
                <Button
                  type="default"
                  className="danger"
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 30,
                  }}
                  onClick={() => {
                    setVisibleDelete(true);
                  }}
                >
                  Hủy phiếu
                </Button>
              </AuthWrapper>
            )}
          </div>
        }
      />
      <Modal
        width={500}
        centered
        visible={visibleDelete}
        onCancel={() => setVisibleDelete(false)}
        onOk={() => {
          setVisibleDelete(false);
          if (procurementData) onDeleteProcument(procurementData);
        }}
        cancelText={`Hủy`}
        okText={`Đồng ý`}
      >
        <Row align="top">
          <DeleteOutlined
            style={{
              fontSize: 40,
              background: "#e24343",
              color: "white",
              borderRadius: "50%",
              padding: 10,
              marginRight: 10,
            }}
          />
          <strong className="margin-top-10">{confirmDeletePhrase}</strong>
        </Row>
      </Modal>
    </ContentContainer>
  )
}

export default ProcurementDetailScreen