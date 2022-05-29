export const DownloadFile = (path: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}