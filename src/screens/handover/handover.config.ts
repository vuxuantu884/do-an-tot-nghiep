const HandoverTransfer = 'TRANSFER';
const HandoverReturn = 'RETURN';
const FulfillmentStatusTransfer = 'packed';
const FulfillmentStatusReturn = 'cancelled';

const HandoverType = [
  {
    value: HandoverTransfer,
    display: 'Biên bản chuyển đi' 
  },
  {
    value: HandoverReturn,
    display: 'Biên bản hoàn về' 
  },
]

const getDisplayHandoverType = (type: string) => {
  return type === HandoverTransfer ? HandoverType[0].display : HandoverType[1].display;
}
export {HandoverType, HandoverTransfer, HandoverReturn, FulfillmentStatusTransfer, FulfillmentStatusReturn, getDisplayHandoverType};