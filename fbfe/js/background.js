let progress = 0;
// 接受content-script的消息
chrome.runtime.onMessage.addListener(
function(req,sender,sendRsp){
	console.log("get content-script message");
	console.log(req,sender,sendRsp);
	// exportExcel(req.greeting.data,req.greeting.filename);
    if (req.cmd == "openDefaultPage") {
        // 打开默认页面
        openDefaultPage();
    }
    else if (req.cmd == "ExportPRogressUpdate"){
        // 更新导出进度
        if (progress == 0){
            chrome.notifications.create("1234",{
                    type: 'progress',
                    iconUrl: '../img/icon.png',
                    title: '1234',
                    message: 'message',
                    progress:progress,
                }
            );
        }
        else{
            chrome.notifications.update("1234",{
                progress:progress,
            });
        }
        progress += 20;
    }
    else if (req.cmd == "StartExportPerPage"){
        // 逐个文件导出
        StartExportPerPage(req.data.allUrl);
    }
    else if (req.cmd == "finishExport"){
        console.log(timeID);
        if (timeID != -1){
            clearTimeout(timeID);
        }
        FinishOnPage();
    }
    else if (req.cmd == "FinishOnePage"){
        // 完成一个文件的导出
        FinishOnPage();
    }
	if (sendRsp) {
		sendRsp(req);
	}
});

// 记录需要导出的页面地址
let urlList2Export = null;
let idx2Export = -1;
function StartExportPerPage( pageList) {
    urlList2Export = [];
    for (let idx = 0; idx < pageList.length; ++idx) {
        urlList2Export.push(
            {
                id:idx,
                url:pageList[idx],
                tab:null
            }
        );
    }
    idx2Export = 0;
    ExportNextPage();
}

// 根据id找到对应现实页面的数据
function getPageInfoByID(id) {
    if (urlList2Export != null){
        for (let idx = 0; idx < urlList2Export.length; ++idx){
            if (urlList2Export[idx].id == id){
                return urlList2Export[idx];
            }
        }
    }
    return null;
}

function FinishOnPage() {
    let tab = urlList2Export[idx2Export].tab;
    ++idx2Export;
    ExportNextPage();
}

let timeID = -1;

function SendMessage2StartExport(tab,msg) {
    timeID = setTimeout(SendMessage2StartExport,1000,tab,msg);
    console.log(timeID);
    console.log(tab);
    chrome.tabs.sendMessage(tab.id,msg,function (res) {
        if (res && res.errCode == 0){
            console.log("clearTimeout");
            if (timeID != -1){
                clearTimeout(timeID);
            }
        }
    })
}

function ExportNextPage() {
    if (idx2Export < urlList2Export.length){
        let id = urlList2Export[idx2Export].id;
        let url = urlList2Export[idx2Export].url;
        chrome.tabs.create(
            {
                url:url
            },
            function(tab) {
                getPageInfoByID(id).tab = tab;
                SendMessage2StartExport(tab,{cmd:"startExport"});
            }
        );
        // 成功打开一个页面
        return true;
    }
    // 没有页面可以打开
    return false;
}

function exportExcel(data,filename){
	console.log(document.body);
	console.log(XLSX);
	console.log(XLSX.utils);
	let wb = XLSX.utils.book_new();
	let ws = XLSX.utils.aoa_to_sheet(data);
	XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
	XLSX.writeFile(wb, filename);
}


function  openDefaultPage() {
    console.log("openDefaultPage");
    chrome.tabs.create(
        {url:"https://www.facebook.com/pg/ROVTH/posts/"}
    );
}