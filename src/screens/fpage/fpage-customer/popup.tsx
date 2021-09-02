import React from "react"
import { HistoryOutlined } from '@ant-design/icons'
import './customer.scss'

interface PopupProps {
    visible: boolean,
    x: number,
    y: number
}

const Popup = ({visible, x, y}: PopupProps) => {
    return visible ? (
        <ul className="popup" style={{left: `${x}px`, top: `${y}px`}}>
          <li><HistoryOutlined />Phân loại nhóm khách hàng</li>
          <li><HistoryOutlined />Phân loại khách hàng</li>
          <li><HistoryOutlined />Phân loại cấp độ khách hàng</li>
          <li><HistoryOutlined />Lịch sử mua hàng</li>
        </ul>): null
}

export default Popup