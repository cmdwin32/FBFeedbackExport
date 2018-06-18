let progress = 0;
let exportData = [];
let timeID = -1;
let isExporting = false;
let downloadTab = null;
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

    }
    else if (req.cmd == "StartExportPerPage"){
        ShowStartingNotify();
        clear();
        // 逐个文件导出
        StartExportPerPage(req.data.allUrl);
    }
    else if (req.cmd == "finishExport"){
        console.log(timeID);
        console.log(req.data);
        if (req.data){
            // 可能有一些页面要放弃导出
            for (let idx = 0; idx < req.data.length ; ++ idx){
                exportData.push(req.data[idx]);
            }
        }
        isExporting = false;
        if (timeID != -1){
            clearTimeout(timeID);
        }
        FinishOnPage();
    }
    else if(req.cmd == 'autoExport'){
        sendMsg2CurrentPage(req);
    }
    else if(req.cmd == 'ExportNotReady'){
        console.log("ExportNotReady");
        console.log(req.data);
        isExporting = false;
        SendMessage2StartExport(
            urlList2Export[idx2Export].tab,
            {cmd:"startExport"}
        );
    }
    else if (req.cmd == 'autoExportIsStared'){
        console.log("autoExportIsStared");
        isExporting = true;
        console.log(isExporting);
    }
    else if(req.cmd == 'downloadFinish'){
        if (downloadTab){
            chrome.tabs.remove(downloadTab.id);
            downloadTab = null;
            ShowFinishNotify();
        }
    }
    else if(req.cmd == 'test'){
        exportData = [[1],[2]];
        FinishAllPage();
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
                url:"https://www.facebook.com/"+pageList[idx].url,
                tab:null
            }
        );
    }
    idx2Export = 0;
    console.log(urlList2Export);
    ShowProgressNoify(0);
    ExportNextPage();
}

function clear() {
    timeID = -1;
    isExporting = false;
    exportData = [];
    if (urlList2Export){
        for (let idx = 0; idx < urlList2Export.length; ++idx){
            if (urlList2Export[idx].tab != null){
                try {
                    chrome.tabs.remove(urlList2Export[idx].tab.id);
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
    urlList2Export = [];
    idx2Export = -1;
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
    chrome.tabs.remove(tab.id);
    ++idx2Export;
    let progress = Math.round(Math.min(idx2Export/urlList2Export.length,1)*100);
    ShowProgressNoify(progress);
    if(ExportNextPage() != true){
        FinishAllPage();
    }
}


function SendMessage2StartExport(tab,msg) {
    console.log(isExporting);
    if (isExporting == false){

        timeID = setTimeout(SendMessage2StartExport,1000,tab,msg);
        console.log(timeID);
        console.log(tab);
        chrome.tabs.sendMessage(tab.id,msg);
    }
    else{
    }

}

function ExportNextPage() {
    // console.log("ExportNextPage:"+idx2Export+"/"+urlList2Export.length+":"+urlList2Export[idx2Export].url);
    if (idx2Export < urlList2Export.length){
        let id = urlList2Export[idx2Export].id;
        let url = urlList2Export[idx2Export].url;
        chrome.tabs.create(
            {
                url:url
            },
            function(tab) {
                console.log("tab create successed");
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

function FinishAllPage() {
    console.log("FinishAllPage");
    console.log(exportData);
    chrome.tabs.create({url:'../html/download.html'},function (tab) {
        downloadTab = tab;
        setTimeout(function () {
            chrome.tabs.sendMessage(tab.id,{cmd:'download',data:exportData});
        },1000);
    })
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


function ShowProgressNoify(progress) {
    // 更新导出进度
    if (progress == 0||true){
        chrome.notifications.create("5920",{
                type: 'progress',
                iconUrl: '../img/icon.png',
                title: 'Facebook Feedback Exporter',
                message: 'System is working,stand by pls...',
                progress:progress,
            }
        );
    }
    else{
        chrome.notifications.update("5920",{
            progress:progress,
        });
    }
}

function ShowStartingNotify() {
    chrome.notifications.create("5920",{
            type: 'basic',
            iconUrl: '../img/icon.png',
            title: 'Facebook Feedback Exporter',
            message: 'System is warming up',
        }
    );
}

function ShowFinishNotify() {
    chrome.notifications.create("5920",{
            type: 'basic',
            iconUrl: '../img/icon.png',
            title: 'Facebook Feedback Exporter',
            message: 'Export finished',
        }
    );
}

function  openDefaultPage() {
    console.log("openDefaultPage");
    chrome.tabs.create(
        {url:"https://www.facebook.com/ROVTH/photos/a.687150514781734.1073741828.685438628286256/1017223268441122/?type=3&theater"},
        function (tab) {

        }
    );
}

function  sendMsg2CurrentPage(msg) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, msg , function(response) {
            console.log(response);
        });
    });
}