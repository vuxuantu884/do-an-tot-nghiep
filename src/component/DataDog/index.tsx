import { datadogRum } from "@datadog/browser-rum";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useSelector } from "react-redux";
import packageJson from "../../../package.json";

export default function DataDog() {
  const env = process.env.REACT_APP_ENVIRONMENT;
  const dataDogAppID = process.env.REACT_APP_DATA_DOG_APP_ID;
  const dataDogClientToken = process.env.REACT_APP_DATA_DOG_CLIENT_TOKEN;
  const dataDogService = process.env.REACT_APP_DATA_DOG_SERVICE;

  const account = useSelector((state: RootReducerType) => state.userReducer.account);
  if (dataDogAppID && dataDogClientToken && dataDogService && account) {
    const allowedTracingUrl = process.env.REACT_APP_DATADOG_ALLOWED_TRACING_ORIGINS;
    const allowedTracingOrigins = allowedTracingUrl ? [allowedTracingUrl] : undefined;
    datadogRum.init({
      applicationId: dataDogAppID,
      clientToken: dataDogClientToken,
      site: "datadoghq.com",
      service: dataDogService,
      env,
      // Specify a version number to identify the deployed version of your application in Datadog
      version: packageJson.version,
      sampleRate: 100,
      sessionReplaySampleRate: 0,
      trackInteractions: true,
      defaultPrivacyLevel: "mask-user-input",
      allowedTracingOrigins,
    });

    // datadogRum.startSessionReplayRecording();

    datadogRum.setUser({
      id: account.code,
      name: account.full_name,
      phone: account.phone,
    });
  }
  return null;
}
