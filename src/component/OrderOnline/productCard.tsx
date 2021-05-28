import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col, Dropdown,
  Input, InputNumber, Menu,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography
} from "antd";
import arrowDownIcon from "../../assets/img/drow-down.svg";
import React, {useCallback} from "react";
import productIcon from "../../assets/img/cube.svg";
import storeBluecon from "../../assets/img/storeBlue.svg";
import {formatCurrency} from "../../utils/AppUtils";
import {  SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import deleteRedIcon from "../../assets/img/deleteRed.svg";
import DiscountGroup from "./discountGroup";


type ProductCardProps = {
  // visible: boolean;
  // onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  // onOk: () => void;
}


const ProductCard: React.FC<ProductCardProps> = (props: ProductCardProps) => {

  const ProductColumn = {
    title: 'Sản phẩm',
    className: 'yody-pos-name',
    // width: 210,
    render: (index: number) => {
      return (
        <div className="w-100" style={{ overflow: 'hidden' }}>
          <div className="d-flex align-items-center">
            <Button onClick={() => console.log(1)} className="yody-pos-delete-item">
              <img src={deleteRedIcon} alt="" />
            </Button>
            <div style={{ width: 'calc(100% - 32px)' }}>
              <div className="yody-pos-sku"><Typography.Link>APN3340 - XXA - XL</Typography.Link></div>
              <div className="yody-pos-varian">
                <Tooltip title="Polo mắt chim nữ - xanh xám - XL" className="yody-pos-varian-name">
                  <span>Polo mắt chim nữ - xanh xám - XL</span>
                </Tooltip>
                {/*<Button hidden={!(!a.show_note && a.note === '')} type="text" className="text-primary text-add-note" onClick={() => {*/}
                {/*  window.requestAnimationFrame(() => setFocus(index));*/}
                {/*  dispatch(showNoteAction(index))}}>Thêm ghi chú</Button>*/}
              </div>
            </div>
          </div>

          {/*{*/}
          {/*  a.gifts.map((a, index1) => (*/}
          {/*    <div key={index1} className="yody-pos-addition yody-pos-gift">*/}
          {/*      <div><img src={giftIcon} alt=""/> {a.variant} <span>({a.quantity})</span></div>*/}
          {/*    </div>*/}
          {/*  ))*/}
          {/*}*/}

          {/*<div className="yody-pos-note" hidden={!a.show_note && a.note === ''}>*/}
          {/*  <Input*/}
          {/*    addonBefore={<EditOutlined />}*/}
          {/*    maxLength={255}*/}
          {/*    allowClear={true}*/}
          {/*    onBlur={() => {*/}
          {/*      if(a.note === '') {*/}
          {/*        dispatch(hideNoteAction(index))*/}
          {/*      }*/}
          {/*    }}*/}
          {/*    className="note"*/}
          {/*    value={a.note}*/}
          {/*    onChange={(e) => dispatch(onOrderItemNoteChange(index, e.target.value))}*/}
          {/*    placeholder="Ghi chú" />*/}
          {/*</div>*/}
        </div>
      )
    }
  };

  const AmountColumnt = {
    title: () => (
      <div className="text-center">
        <div>Số lượng</div>
        <span style={{ color: '#0080FF' }}>(3)</span>
      </div>
    ),
    className: 'yody-pos-quantity text-center',
    // width: 80,
    render: (index: number) => {
      return (
        <div className="yody-pos-qtt">
          <Input
            onChange={(e) => console.log(1)}
            value={3}
            minLength={1}
            maxLength={4}
            onFocus={(e) => e.target.select()}
            style={{ width: 60, textAlign: "right" }} />
        </div>
      )
    }
  };

  const PriceColumnt = {
    title: 'Đơn giá',
    className: 'yody-pos-price text-right',
    // width: 100,
    render: (index: number) => {
      return (
        <div className="yody-pos-price">
          <InputNumber
            className="hide-number-handle"
            min={0}
            // formatter={value => formatCurrency(value ? value : '0')}
            // parser={value => replaceFormat(value ? value : '0')}
            value={100000}
            onChange={(e) => console.log(1)}
            onFocus={(e) => e.target.select()}
            style={{ maxWidth: 100, textAlign: "right" }}
          />
        </div>
      )
    }
  };

  const DiscountColumnt = {
    title: 'Chiết khấu',
    // align: 'center',
    width: 115,
    className: 'yody-table-discount text-right',
    render: (index: number) => {
      return (
        <div className="site-input-group-wrapper">
          <DiscountGroup index={index}
                         discountRate={0}
                         discountValue={0}
                         totalAmount={0} />
        </div>
      )
    }
  };

  const TotalPriceColumn = {
    title: 'Tổng tiền',
    className: 'yody-table-total-money text-right',
    // width: 100,
    render: () => {
      return (
        <div>
          1000000
        </div>
      )
    }
  };

  const ActionColumn = {
    title: 'Thao tác',
    width: 85,
    className: 'yody-table-action text-center',
    render: (index: number) => {
      const menu = (
        <Menu className="yody-line-item-action-menu">
          <Menu.Item key="0">
            <Button type="text" className="p-0 m-0 w-100" >Thêm quà tặng</Button>
          </Menu.Item>
          <Menu.Item key="1">
            <Button type="text" className="p-0 m-0 w-100">Thêm ghi chú</Button>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className="site-input-group-wrapper">
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Button type="text" className="ant-dropdown-link circle-button yody-pos-action" onClick={e => console.log(1)}>
              <img src={arrowDownIcon} alt="" />
            </Button>
          </Dropdown>
        </div>
      )
    }
  };
  const columns = [ProductColumn, AmountColumnt, PriceColumnt, DiscountColumnt, TotalPriceColumn, ActionColumn];

  return (
    <Card className="card-block sale-online-product"
          title={<div className="d-flex"><img src={productIcon} alt="" /> Sản phẩm</div>}
          extra={
            <Row>
              <Space>
                <div>
                  <Checkbox className="checkbox-style" style={{ fontSize: 14 }}
                            onChange={() => console.log(1)}>Tách dòng</Checkbox>
                </div>
                <div className="price-policy">
                  <label htmlFor="" style={{ marginRight: 10 }}>Chính sách giá</label>
                  <Select defaultValue="1" style={{ minWidth: 130 }}>
                    <Select.Option value="1">Giá bán lẻ</Select.Option>
                    <Select.Option value="2">Giá bán buôn</Select.Option>
                  </Select>
                </div>
                <div className="view-inventory-box">
                  <Button type="link" className="p-0">
                    <Space>
                      <img src={storeBluecon} alt=""/>
                      Xem tồn
                      <ArrowRightOutlined />
                    </Space>
                  </Button>
                </div>
              </Space>
            </Row>
          }>
      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Cửa hàng</label>
            {/*<Input placeholder="Chuyển Khoản"*/}
            {/*       suffix={<img src={arrowDownIcon} alt="down" />}*/}
            {/*/>*/}

            <Select className="select-with-search" showSearch
                    style={{ width: '100%' }}
                    placeholder=""
            >
              <Select.Option value="1">YODY Kho Online</Select.Option>
              <Select.Option value="2">YODY Tứ Kỳ</Select.Option>
              <Select.Option value="3">YODY Nam Sách</Select.Option>
              <Select.Option value="4">YODY Hải Dương</Select.Option>
            </Select>
          </div>
        </Col>
        <Col xs={24} lg={16}>
          <div className="form-group form-group-with-search">
            <label htmlFor="" className="">Sản phẩm</label>
            <div>
              <AutoComplete>
                <Input
                  placeholder="Tìm sản phẩm/ SKU/ mã vạch (F3)"
                  prefix={<SearchOutlined style={{ color: '#ABB4BD' }} />}
                />
              </AutoComplete>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="sale-product-box">
        <Table
          locale={{
            emptyText: (
              <Button type="text" className="font-weight-500"
                      style={{ color: '#2A2A86', background: 'rgba(42,42,134,0.05)', borderRadius: 5, padding: 8, height: 'auto', marginTop: 15, marginBottom: 15 }}
              >Thêm sản phẩm ngay (F3)</Button>
            )
          }}
          rowKey={record => record.uid}
          columns={columns}
          // dataSource={OrderItemModel}
          className="sale-product-box-table w-100"
          tableLayout="auto"
          pagination={false}
          summary={pageData => {
            let totalBorrow = 0;
            let totalRepayment = 0;

            pageData.forEach(({borrow, repayment}) => {
              totalBorrow += borrow;
              totalRepayment += repayment;
            });

            console.log(pageData);

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={1} colSpan={2}>Tổng</Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Typography.Text>{formatCurrency(987000)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Typography.Text type="danger">{formatCurrency(296100)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Typography.Link>{formatCurrency(690900)}</Typography.Link>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}/>
              </Table.Summary.Row>
            );
          }}
        />
      </Row>

      <Row className="sale-product-box-payment" gutter={24}>
        <Col xs={24} lg={12}>
          <div className="payment-row"><Checkbox className="checkbox-style" onChange={() => console.log(1)}>Bỏ chiết khấu tự động</Checkbox></div>
          <div className="payment-row"><Checkbox className="checkbox-style" onChange={() => console.log(1)}>Không tính thuế VAT</Checkbox></div>
          <div className="payment-row"><Checkbox className="checkbox-style" onChange={() => console.log(1)}>Bỏ tích điểm tự động</Checkbox></div>
        </Col>
        <Col xs={24} lg={12}>
          <Row className="payment-row" justify="space-between">
            <div className="font-weight-500">Tổng tiền</div>
            <div className="font-weight-500 payment-row-money">690.900</div>
          </Row>

          <Row className="payment-row" justify="space-between" align="middle">
            <Space align="center">
              <Typography.Link className="font-weight-500">Chiết khấu</Typography.Link>
              <div className="badge-style badge-danger">10% <Button type="text" className="p-0">x</Button></div>
            </Space>
            <div className="font-weight-500 ">69.090</div>
          </Row>

          <Row className="payment-row" justify="space-between" align="middle">
            <Space align="center">
              <Typography.Link className="font-weight-500">Mã giảm giá</Typography.Link>
              <div className="badge-style badge-primary">SN50 <Button type="text" className="p-0">x</Button></div>
            </Space>
            <div className="font-weight-500 ">41.810</div>
          </Row>

          <Row className="payment-row" justify="space-between">
            <div className="font-weight-500">Phí ship báo khách</div>
            <div className="font-weight-500 payment-row-money">20.000</div>
          </Row>

          <Row className="payment-row" justify="space-between">
            <div className="font-weight-500">Khách cần trả</div>
            <div className="font-weight-500 payment-row-money">
              <Typography.Text type="success" className="font-weight-500">600.000</Typography.Text>
            </div>
          </Row>
        </Col>
      </Row>
    </Card>
  )
}

export default ProductCard;
