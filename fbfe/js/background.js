let progress = 0;
let exportData = [];
let timeID = -1;
let isExporting = false;
let downloadTab = null;
let gNeedExpand = false;
// 接受content-script的消息
chrome.runtime.onMessage.addListener(
function(req,sender,sendRsp){
	console.log("get content-script message");
	console.log(req);
	// console.log(req,sender,sendRsp);
	// exportExcel(req.greeting.data,req.greeting.filename);
    // popup界面传入的命令：
    if (req.cmd == "openDefaultPage") {
        // 打开默认页面
        openDefaultPage();
        if (req.needExpand !== null && req.needExpand != undefined){
            gNeedExpand = req.needExpand;
        }
    }
    else if (req.cmd == "autoExportOneWeek") {
        // 自动导出7天
        if (req.needExpand !== null && req.needExpand != undefined){
            gNeedExpand = req.needExpand;
        }
        let endDate = new Date();
        endDate.setDate(endDate.getDate()-7);
        autoExportWithDataRange(new Date(),endDate);
    }
    else if (req.cmd == "autoExportTwoWeek") {
        // 自动导出15天
        if (req.needExpand !== null && req.needExpand != undefined){
            gNeedExpand = req.needExpand;
        }
        let endDate = new Date();
        endDate.setDate(endDate.getDate()-15);
        autoExportWithDataRange(new Date(),endDate);
    }
    else if (req.cmd == "autoExportOneMonth") {
        // 自动导出30天
        if (req.needExpand !== null && req.needExpand != undefined){
            gNeedExpand = req.needExpand;
        }
        let endDate = new Date();
        endDate.setDate(endDate.getDate()-30);
        autoExportWithDataRange(new Date(),endDate);
    }
    else if (req.cmd == "StartExportWithDateRange"){
        if (req.needExpand !== null && req.needExpand != undefined){
            gNeedExpand = req.needExpand;
        }
        autoExportWithDataRange(req.startTime,req.endTime);
    }
    // inject传入的命令
    else if (req.cmd == "StartExportPerPage"){
        ShowStartingNotify();
        clear();
        // 逐个文件导出
        StartExportPerPage(req.data.allUrl);
    }
    else if (req.cmd == "finishExport"){
        console.log("finishExport");
        if (req.data){
            // 可能有一些页面要放弃导出
            let idx = 0;

            for (; idx < req.data.length ; ++ idx){
                if (idx2Export == 0 && idx == 0){
                }
                else{
                    req.data[idx][config.index.totleInteractiveTimes] =
                        0 + req.data[idx][config.index.totleLike]
                        + req.data[idx][config.index.shareTimes]
                        + req.data[idx][config.index.discussTims];
                }
                exportData.push(req.data[idx]);
            }
        }
        isExporting = false;
        console.log(timeID);
        if (timeID != -1){
            clearTimeout(timeID);
            timeID = -1;
        }
        FinishOnPage();
    }
    else if(req.cmd == 'autoExport'){
        sendMsg2CurrentPage(req);
    }
    else if(req.cmd == 'ExportNotReady'){
        console.log("ExportNotReady");
        // console.log(req.data);
        isExporting = false;
        console.log(timeID);
        if (timeID != -1){
            clearTimeout(timeID);
            timeID = -1;
        }
        timeID = setTimeout(
            SendMessage2StartExport,
                1000,
                urlList2Export[idx2Export].tab,
                {cmd:"startExport",titleData:(idx2Export==0),needExpand:gNeedExpand}
        )
        ;
    }
    else if (req.cmd == 'autoExportIsStared'){
        console.log("autoExportIsStared");
        isExporting = true;
        console.log(isExporting);
        console.log(timeID);
        if (timeID != -1){
            clearTimeout(timeID);
            timeID = -1;
        }
    }
    else if(req.cmd == 'downloadFinish'){
        if (downloadTab&&false){
            chrome.tabs.remove(downloadTab.id);
            downloadTab = null;
            ShowFinishNotify();
        }
    }
    else if(req.cmd == 'reDownload'){
        // 根据您当前的数据直接打开下载页
        FinishAllPage();
    }
    else if (req.cmd == 'stop'){
        // https://www.facebook.com/ROVTH/videos/1051723454991103/
    }
    else if (req.cmd == 'reTry'){
        sendMsg2CurrentPage({cmd:"reStartExport",titleData:(idx2Export==0)});
    }
    else  if (req.cmd == "ignore") {
        sendMsg2CurrentPage({cmd:"ignore"});
    }
    else if (req.cmd == "nextpage"){
        ExportNextPage();
    }
    else if (req.cmd == "finishpage"){
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
                url:"https://www.facebook.com"+pageList[idx].url,
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
    console.log("clear");
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
    console.log(id);
    // console.log(urlList2Export);
    console.log(idx2Export);
    if (urlList2Export != null){
        for (let idx = 0; idx < urlList2Export.length; ++idx){
            if (urlList2Export[idx] &&  urlList2Export[idx].id == id){
                return urlList2Export[idx];
            }
        }
    }
    return null;
}

function FinishOnPage() {
    let tab = urlList2Export[idx2Export].tab;
    if (tab )
    {
        chrome.tabs.remove(tab.id);
    }
    ++idx2Export;
    let progress = Math.round(Math.min(idx2Export/urlList2Export.length,1)*100);
    ShowProgressNoify(progress,idx2Export,urlList2Export.length);
    if(ExportNextPage() != true){
        FinishAllPage();
    }
}


function SendMessage2StartExport(tab,msg,times=0) {
    console.log(isExporting);
    if (times > 5){ // 最多重试5次，每次等待时间都要变长
        return;
    }
    if (isExporting == false){
        // isExporting = true;
        console.log(tab.url);
        if (timeID != -1){
            clearTimeout(timeID);
        }
        timeID = setTimeout(SendMessage2StartExport,1000*(times+1),tab,msg,++times);
        console.log(msg);
        chrome.tabs.sendMessage(tab.id,msg);
        // chrome.tabs.query({/*active: true,*/ currentWindow: true}, function(tabs) {
        //     let found = false;
        //     for (let idx = 0; idx < tabs.length; ++idx){
        //         console.log(tabs[idx]);
        //         console.log(
        //             tabs[idx].url+":"+tab.url
        //         )
        //         console.log(tabs[idx].url == tab.url);
        //         if (tabs[idx].url == tab.url){
        //             found = true;
        //             break;
        //         }
        //     }
        //     if (found != true){
        //         console.log("tab not active");
        //         ExportNextPage();
        //     }
        //     else{
        //
        //         timeID = setTimeout(SendMessage2StartExport,1000,tab,msg);
        //         // console.log(timeID);
        //         // console.log(tab);
        //         chrome.tabs.sendMessage(tab.id,msg);
        //     }
        // });
    }
    else{
        console.log("SendMessage2StartExport isexporting true ");
    }

}

function ExportNextPage() {
    if (idx2Export < urlList2Export.length){
        if (urlList2Export.length > 0){
            console.log("ExportNextPage:"+idx2Export+"/"+urlList2Export.length+":"+urlList2Export[idx2Export].url);
        }
        let id = urlList2Export[idx2Export].id;
        let url = urlList2Export[idx2Export].url;
        // if (url.indexOf("posts") > 0) {
        //     let line = new Array(20);
        //     line[1] = "skip";
        //     line[19] = url;
        //     exportData.push(line);
        //     ++idx2Export;
        //     // ExportNextPage();
        //     FinishOnPage();
        //     return true;
        // }
        // else{
            chrome.tabs.create(
                {
                    url:url
                },
                function(tab) {
                    console.log("tab create successed");
                    console.log(tab);
                    if (tab){
                        let page = getPageInfoByID(id);
                        if (page){
                            page.tab = tab;
                            let req = {cmd:"startExport",needExpand:gNeedExpand};
                            if (idx2Export == 0){
                                req.titleData = true;
                            }
                            SendMessage2StartExport(tab,req);
                        }
                        else{
                            console.log("tab is null");
                            // ExportNextPage();
                        }
                    }
                    else{
                        console.log("tab is null");
                        setTimeout(ExportNextPage,10000);
                        // ExportNextPage();
                    }
                }
            );
        // }
        // 成功打开一个页面
        return true;
    }
    // 没有页面可以打开
    return false;
}

function findTab(url,callback) {
    chrome.tab.query({url:url},function (tabs) {
        if (tabs && tabs.length > 0){
            if (callback){
                callback(tabs);
            }
            return true;
        }
    })
    return false;
}

function FinishAllPage() {
    console.log("FinishAllPage");
    // console.log(exportData);
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


function ShowProgressNoify(progress,a,b) {
    // 更新导出进度
    msg = "System is working,stand by pls..."
    if (a && b){
        msg += "\n("+a+"/"+b+")";
    }
    if (progress == 0||true){
        chrome.notifications.create("5920",{
                type: 'progress',
                iconUrl: '../img/icon.png',
                title: 'Facebook Feedback Exporter',
                message: msg,
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
            message: 'System finish warming up',
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

function autoExportWithDataRange(startTime,endTime) {
    clear();
    startTime = Utils.getTimestamp(startTime);
    endTime = Utils.getTimestamp(endTime);
    console.log(startTime);
    console.log(endTime);
    // 打开默认主页
    let url = "https://www.facebook.com/pg/ROVTH/posts";
    chrome.tabs.create(
        {url:url},
        function (tab) {
            if (tab){
                // 打开成功，发送自动导出消息
                setTimeout(
                    SendMessage2StartExport,
                    5000,
                    tab,
                    {cmd:"autoExportWithDataRange",data:{startTime:startTime,endTime:endTime},needExpand:gNeedExpand}
                );
            }
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