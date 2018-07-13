
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
        },
        function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#test").click(e=>{
    chrome.runtime.sendMessage({cmd:"StartExportPerPage",data:{allUrl:[{url:"/ROVTH/posts/1040500582780057"}]}},function (response) {
        
    })
});

$("#autoExportOneWeek").click( e=>{
    console.log("autoExportOneWeek");
    chrome.runtime.sendMessage({cmd:"autoExportOneWeek"}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#autoExportTwoWeek").click( e=>{
    console.log("autoExportTwoWeek");
    chrome.runtime.sendMessage({cmd:"autoExportTwoWeek"}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
});

$("#autoExportOneMonth").click( e=>{
    console.log("autoExportOneMonth");
    chrome.runtime.sendMessage({cmd:"autoExportOneMonth"}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
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