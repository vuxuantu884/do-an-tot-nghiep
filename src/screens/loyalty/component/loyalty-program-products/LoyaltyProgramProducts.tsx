import { Input, Modal } from "antd"
import search from "assets/img/search.svg";
import { useCallback, useMemo, useState } from "react";

interface ModalProp {
  visible: boolean
  onCancel: () => void
  items: any[]
}

const LoyaltyProgramProducts = (props: ModalProp) => {
  const { visible, onCancel, items } = props
  const [keyword, setKeyword] = useState<string>('')

  const handleChangeKeyword = useCallback((event: any) => {
    setKeyword(event.target.value)
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter(item => item.name?.toLowerCase().includes(keyword?.toLowerCase()) || item.sku?.toLowerCase().includes(keyword?.toLowerCase()))
  }, [keyword, items])

  return (
    <Modal
      visible={visible}
      width="35%"
      onCancel={onCancel}
      maskClosable
      closable={false}
      okButtonProps={{style: {display: 'none'}}}
      cancelButtonProps={{style: {display: 'none'}}}
      footer={null}
    >
      <div className="products-modal">
        <Input
          prefix={<img src={search} alt="" />}
          className="search-input"
          placeholder="Tìm kiếm"
          onChange={handleChangeKeyword}
        />
        <div className="item-wrapper">
          {
            filteredItems.map(item => (
              <div className="product-item" key={item.id}>
                <div className="product-item__name">{item.name}</div>
                <div className="product-item__sku">{item.sku}</div>
              </div>
            ))
          }
        </div>
      </div>
    </Modal>
  )
}

export default LoyaltyProgramProducts