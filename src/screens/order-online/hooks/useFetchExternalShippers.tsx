import { ExternalShipperGetListAction } from "domain/actions/account/account.action";
import { DeliverPartnerResponse } from "model/account/account.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useFetchExternalShippers() {
  const [externalShippers, setExternalShippers] = useState<Array<DeliverPartnerResponse> | null>(
    null,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(ExternalShipperGetListAction(setExternalShippers));
  }, [dispatch]);

  return externalShippers;
}

export default useFetchExternalShippers;
