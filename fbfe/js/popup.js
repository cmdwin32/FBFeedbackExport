
$("#openDefaultPage").click( e=>{
        console.log("openDefaultPage");
        chrome.runtime.sendMessage({cmd:"test"}, function(response) {
            console.log('收到来自后台的回复：' + response);
        });
    }
);

$("#autoExport").click( e=>{
    console.log("autoExport");
    chrome.runtime.sendMessage({
        cmd:"StartExportPerPage",
        data:{
            allUrl:[
                "https://www.facebook.com/ROVTH/photos/a.687150514781734.1073741828.685438628286256/1017223268441122/?type=3&theater",
                "https://www.facebook.com/ROVTH/photos/a.687150514781734.1073741828.685438628286256/1020362341460548/?type=3&theater",
                "https://www.facebook.com/ROVTH/videos/1016284745201641/",
            ]
        }
        },function (res) {
        console.log(res);
    })
});

$(function(){
    console.log("popup js load finished");
});

function noused() {
    console.log("no used");
}
