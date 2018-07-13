let data;
// 添加与background的通讯监听
if (chrome && chrome.runtime && chrome.runtime.onMessage){

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)

    {
        console.log("bg event:");
        console.log(request);
        // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
        if(request.cmd == 'download') {
            data = request.data;
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
        console.log(cvsData);
        download2(fileName,cvsData);
    }
}

function download2(filename,data) {
    let fs = streamSaver.createWriteStream(filename);
    let writer = fs.getWriter();
    let encoder = new TextEncoder();
    let text = encoder.encode(data);
    // let n = ~~prompt("How many MiB of lorem ipsum text do you want?", '1024');
    console.log(text.length);
    writer.write(text).then(()=>{writer.close()});
}

// 从内存中下载文件
function download(filename, text) {
    
    let element = document.createElement('a');
    element.setAttribute('href', 'data:octet/stream;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    // document.body.removeChild(element);
}

$("#download").click(e=>{
    exportCVSFile(data);
})
$("#download2").click(e=>{
    download2("a.cvs",data);
})
