import { datadogRum } from "@datadog/browser-rum";

const env = process.env.NODE_ENV;
const dataDogAppID = process.env.REACT_APP_DATA_DOG_APP_ID;
const dataDogClientToken = process.env.REACT_APP_DATA_DOG_CLIENT_TOKEN;
const dataDogService = process.env.REACT_APP_DATA_DOG_SERVICE;

if (dataDogAppID && dataDogClientToken && dataDogService) {
  datadogRum.init({
    applicationId: dataDogAppID,
    clientToken: dataDogClientToken,
    site: "datadoghq.com",
    service: dataDogService,
    env: env,
    // Specify a version number to identify the deployed version of your application in Datadog
    version: "1.0.0",
    sampleRate: 100,
    premiumSampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: "mask-user-input",
  });

  datadogRum.startSessionReplayRecording();
}

export default function DataDog() {
  return null;
}
