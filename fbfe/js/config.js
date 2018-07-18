// 导出时用到的配置信息
const config ={
    // 多语言的查找字符
     langauge : {
        "cht":{
            "wan":"萬",
            "zan":"讚",
            "daxin":"大心",
            "wa":"哇",
            "ha":"哈",
            "wu":"嗚",
            "nu":"怒",
            "playTimes":"",
            "shareTimes":"",
            "youAndOthers":"你和其他",
            "hidden":"隐藏",
            "discuss":"评论",
            "share":"分享",
            "moreDiscuss":"更多评论",
            "discussBefore":"之前的评论",
            "writeDiscuss":"写评论",
        },
        "chs":{
            "wan":"万",
            "zan":"赞",
            "daxin":"大爱",
            "wa":"哇",
            "ha":"笑趴",
            "wu":"心碎",
            "nu":"怒",
            "playTimes":"次播放",
            "shareTimes":"次分享",
            "youAndOthers":"你和其他",
            "hidden":"隐藏",
            "discuss":"评论",
            "share":"分享",
            "moreDiscuss":"更多评论",
            "discussBefore":"之前的评论",
            "writeDiscuss":"写评论",
        },
        "en":{

        }
    },
    // 所有单元格的索引值
    index : {
        id : 0,
        type : 1,
        title:2,
        content : 3,
        videoUrl:4,
        videoTime:5,
        playTimes:6,
        author : 7,
        date : 8,
        time : 9,
        shareTimes : 10,
        discussTims : 11,
        totleLike : 12,
        zan : 13,
        daxin : 14,
        wa : 15,
        ha : 16,
        wu : 17,
        nu : 18,
        localUrl:19,
        totleInteractiveTimes:20,
    },
    langType : "chs",

}

function getLangText  (key){
    if (config && config.langauge && config.langType && config.langauge[config.langType]){
        return config.langauge[config.langType][key];
    }
    else{
        return "";
    }
}
// 所有单元格的名称
config.keys = [
    "id",
    "类型",
    "标题",
    "内容",
    "视频链接",
    "视频时长",
    "播放次数",
    "作者姓名",
    "发布日期",
    "发布时间",
    "分享次数",
    "评论次数",
    "总点赞",
    getLangText("zan"),
    getLangText("daxin"),
    getLangText("wa"),
    getLangText("ha"),
    getLangText("wu"),
    getLangText("nu"),
    "分享链接",
    "总互动次数",
];

console.log(document.charset)
console.log(config.keys);