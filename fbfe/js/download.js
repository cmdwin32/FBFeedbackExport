// 添加与background的通讯监听
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    console.log("bg event:");
    console.log(request);
    // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
    if(request.cmd == 'download') {
        exportCVSFile(request.data);
        chrome.runtime.sendMessage({cmd:'downloadFinish'}, function(response) {
            console.log('收到来自后台的回复：' );
            console.log(response);
        });
    }
});
window.addEventListener('message',function(e){
    console.log("message");
    if (e.data.cmd == 'download'){
        exportCVSFile(request.data);
        chrome.runtime.sendMessage({cmd:'downloadFinish'}, function(response) {
            console.log('收到来自后台的回复：' );
            console.log(response);
        });
    }
},false);
function exportCVSFile(resData){
    let options = {
        weekday: "long", year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit"
    };
    let d = new Date();
    let fileName = "FBData_"+d.toLocaleTimeString("ch-CN",options)+".csv";
    let cvsData = "";
    for(let i = 0; i < resData.length; ++i){
        if (resData[i]) {

            for (let j = 0; j < resData[i].length; ++j){
                if (resData[i][j]) {
                    cvsData += resData[i][j]+",";
                }
                else{
                    cvsData += ",";
                }
            }
        }
        cvsData += "\n";
    }
    download(fileName,cvsData);
}
// 从内存中下载文件
function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
