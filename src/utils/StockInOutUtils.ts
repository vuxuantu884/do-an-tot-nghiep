export const downloadErrorDetail = (dataUploadError: any) => {
  if (!dataUploadError) return;
  let newDataUploadError = "";

  dataUploadError.forEach((item: any) => {
    newDataUploadError = newDataUploadError + item + "\n";
  });
  const downloadableLink = document.createElement("a");
  downloadableLink.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(newDataUploadError),
  );
  downloadableLink.download = "Log.txt";
  document.body.appendChild(downloadableLink);
  downloadableLink.click();
  document.body.removeChild(downloadableLink);
};
