import UrlConfig from "config/url.config";
import React, {ReactElement} from "react";
import {Redirect} from "react-router";

// interface Props {}

function GiftList(): ReactElement {
  return <Redirect to={`${UrlConfig.PROMOTION}${UrlConfig.GIFT}/create`} />;
}

export default GiftList;
