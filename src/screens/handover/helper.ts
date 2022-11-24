import { showModalError } from "utils/ToastUtils";
import audioError from "assets/audio/am-bao-tra-loi-sai.wav";

export const showModalErrorAudio = (msg: React.ReactNode, title?: string | undefined) => {
  const AudioErrorPlay = new Audio(audioError);
  AudioErrorPlay.play();
  AudioErrorPlay.currentTime = 1;
  showModalError(msg, title);
};

export const getErrorMessageApi = (msg: any) => {
  let textApiInformation = [];
  if (!Array.isArray(msg)) {
    textApiInformation.push(msg);
  } else {
    msg.forEach((e: any) => textApiInformation.push(e));
  }

  return textApiInformation;
};
