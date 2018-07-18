console.log(document.charset);
$("#openDefaultPage").click( e=>{
        console.log("reDownload");
        chrome.runtime.sendMessage({cmd:"reDownload"}, function(response) {
            console.log('收到来自后台的回复：' + response);
        });
    }
);

$("#autoExport").click( e=>{
    console.log("autoExport");
    var dataStart = $("#startTime").val();
    var dataEnd = $("#endTime").val();
    var needExpand = $("#needExpand").prop('checked');
    // dataStart = (new Date(dataStart)).getTime();
    // dataEnd = (new Date(dataEnd)).getTime();
    dataStart = getTimestamp(dataStart);
    dataEnd = getTimestamp(dataEnd);
    console.log(dataStart);
    console.log(dataEnd);
    chrome.runtime.sendMessage(
        {
            cmd:"StartExportWithDateRange",
            startTime:dataStart,
            endTime:dataEnd,
            needExpand:needExpand
},
        function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#test").click(e=>{ // https://www.facebook.com/ROVTH/posts/1042783195885129
    chrome.runtime.sendMessage({cmd:"StartExportPerPage",data:{allUrl:[{url:"/ROVTH/photos/a.687150514781734.1073741828.685438628286256/983947705102012/?type=3"},{url:"/ROVTH/videos/983745925122190/"},{url:"/ROVTH/videos/982635121899937/"},{url:"/ROVTH/videos/982574958572620/"},{url:"/ROVTH/photos/a.687150514781734.1073741828.685438628286256/982553545241428/?type=3"}]}},function (response) {
        
    })
});

$("#autoExportOneWeek").click( e=>{
    console.log("autoExportOneWeek");
    var needExpand = $("#needExpand").prop('checked');
    chrome.runtime.sendMessage({cmd:"autoExportOneWeek",needExpand:needExpand}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#autoExportTwoWeek").click( e=>{
    console.log("autoExportTwoWeek");
    var needExpand = $("#needExpand").prop('checked');
    chrome.runtime.sendMessage({cmd:"autoExportTwoWeek",needExpand:needExpand}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#autoExportOneMonth").click( e=>{
    console.log("autoExportOneMonth");
    var needExpand = $("#needExpand").prop('checked');
    chrome.runtime.sendMessage({cmd:"autoExportOneMonth",needExpand:needExpand}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#reTry").click( e=>{
    console.log("reTry");
    var needExpand = $("#needExpand").prop('checked');
    chrome.runtime.sendMessage({cmd:"reTry",needExpand:needExpand}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#ignore").click( e=>{
    console.log("ignore");
    chrome.runtime.sendMessage({cmd:"ignore"}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#nextpage").click(e=>{
    console.log("nextpage");
    var needExpand = $("#needExpand").prop('checked');
    chrome.runtime.sendMessage({cmd:"nextpage",needExpand:needExpand}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#finishpage").click(e=>{
    console.log("finishpage");
    var needExpand = $("#needExpand").prop('checked');
    chrome.runtime.sendMessage({cmd:"finishpage",needExpand:needExpand}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#exportOnePage").click(e=>{
    let url = $("#exportUrl").val();
    url = url.replace("https://www.facebook.com/","/")
    if (url){
        chrome.runtime.sendMessage(
            {cmd:"StartExportPerPage",data:{allUrl:[{url:url}]}}
            ,function (response) {}
        );
    }
});

$(function(){
    console.log("popup js load finished");
});

function noused() {
    console.log("no used");
}
function getTimestamp(date){
    date = date.replace(/'-'/g,'/');
    let d = new Date();
    let n = d.getTimezoneOffset();
    return Math.round(new Date(date).getTime()/1000)+n * 60; //先获得utc时间，然后根据本地的时区差值，计算本地时间
}

// 设置初始时间
var now = new Date();

var day = ("0" + now.getDate()).slice(-2);
var month = ("0" + (now.getMonth() + 1)).slice(-2);

var today = now.getFullYear()+"-"+(month)+"-"+(day) ;

$('#startTime').val(today);
$('#endTime').val(today);