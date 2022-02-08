export const ProcurementListWarning = (text: string)=>{
    return (
      <>
      <div style={{wordBreak: "break-word"}}>
          <div>Phiếu nhập kho <b>{text}</b> không thỏa mãn điều kiện xác nhận nhiều phiếu cùng lúc.</div>
          <div>Vui lòng chọn các phiếu có cùng:</div>
          <ul>
              <li>Nhà cung cấp</li>
              <li>Ngày và kho nhận hàng dự kiến</li>
              <li>Phiếu đã duyệt</li>
          </ul> 
      </div>
      </>
    );
  } 