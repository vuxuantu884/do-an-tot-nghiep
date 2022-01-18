import { Avatar } from "antd";
import { SupplierResponse } from "model/core/supplier.model";
import avatarDefault from 'assets/icon/user.svg';

type SupplierItemProps = {
  data: SupplierResponse
}

const SupplierItem: React.FC<SupplierItemProps> = (props: SupplierItemProps) => {
  const {data} = props;
  return (
    <div className="supplier-item">
      <Avatar src={avatarDefault} />
      <div className="supplier-item-title">
        <span className="supplier-item-name">{data.name}</span>
        {
          data.contacts?.map(contact => (
            <span key={contact.id} className="supplier-item-phone">
              <span className="icon-dot supplier-item-dot" />
              <span>{contact.phone}</span>
            </span>
          ))
        }
      </div>
    </div>
  )
}

export default SupplierItem;
