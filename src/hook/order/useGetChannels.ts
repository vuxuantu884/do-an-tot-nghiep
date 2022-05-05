import { ChannelResponse } from "model/response/product/channel.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getChannelApi } from "service/order/order.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useGetChannels() {
  const [channels, setChannels] = useState<Array<ChannelResponse>>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    getChannelApi().then((response) => {
      console.log("response", response);
      if (isFetchApiSuccessful(response)) {
        setChannels(response.data);
      } else {
        handleFetchApiError(response, "Danh sách kênh", dispatch);
      }
    });
  }, [dispatch]);

  return channels;
}

export default useGetChannels;
