// console.log("inject loaded");
// 标记是否是自动导出
let isAutoExport = false;

function findAllFeedBack(startTime,endTime,callback)
{
	LoadPageWithDataRange(startTime,endTime,callback);
}


let gTitleData = null;
let gNoEXpand = false; // 不展开
let gCurrentUrl = ''; // 传进来的初始url

let lpTimerID = 0;

// 根据一个时间范围加载页面
function LoadPageWithDataRange(startTimestamp,endTimestamp,callBack){
    lpTimerID = setInterval(lpDataRageIMP,5000,startTimestamp,endTimestamp,callBack);
}

function lpDataRageIMP(startTimestamp,endTimestamp,callBack) {
    let timeList = [];
    // 查找到所有分享
    let nL = document.getElementsByClassName("userContentWrapper");
    console.log("nL"+nL.length);
    let timeNode = nL[nL.length-1].getElementsByClassName("timestampContent");
    let lastTime = 0;
    if (timeNode && timeNode.length > 0) {
        lastTime = timeNode[0].parentNode.getAttribute("data-utime");
    }
    nL = [];
    nL = null;
    // console.log(timeList);
    console.log(lastTime);
    console.log(endTimestamp);
    // 如果没有加载到指定的结束时间，就调用页面的继续加载接口
    if (lastTime > endTimestamp) {
        // 直接查询物理位置最后一个，这样可以避免置顶的帖子很旧的问题
        // let getMorePageNode = document.getElementsByClassName("uiMorePager");
        // console.log(getMorePageNode);
        // if (getMorePageNode && getMorePageNode.length > 0) {
        //     for (var idx = 0 ; idx < getMorePageNode.length; ++ idx){
        //        // getMorePageNode[idx].scrollIntoView();
        //        // console.log("scrollIntoView:"+idx);
        //        // console.log(getMorePageNode[idx]);
        //        // dispatch(getMorePageNode[idx],"click");
        //    }
        // 	// 加载下一页
        // 	setTimeout(LoadPageWithDataRange,3000,startTimestamp,endTimestamp,callBack);
        // }
        // else{
        // 	// console.log("no uiMorePager");
        // 	// console.log(getMorePageNode);
        //    if (callBack){
        //        callBack();
        //    }
        // }
        // 直接滚到页底
        window.scrollTo(0, document.body.scrollHeight);
        // 加载下一页
        // setTimeout(LoadPageWithDataRange,5000,startTimestamp,endTimestamp,callBack);

    }
    else{
        if (lpTimerID > 0){
            clearImmediate(lpTimerID);
            lpTimerID = 0;
        }
        // console.log(timeList);
        // console.log(endTimestamp);
        if (callBack){
            callBack();
        }
    }
}

// 导出数据的入口
function expansPostContent(){
    // TODO：这里要修改成导出一个指定的分享
    // 处理照片墙
    // 首先找到和host相同的分享
    let cN = document.getElementsByClassName("userContentWrapper");
    console.log(cN);
    for (let idx = 0; idx < cN.length; ++idx){
        let timeNode = cN[idx].getElementsByClassName("timestampContent");
        if (timeNode && timeNode[0] && timeNode[0].parentNode && timeNode[0].parentNode.parentNode && timeNode[0].parentNode.parentNode.nodeName === "A"){
            let url =  timeNode[0].parentNode.parentNode.getAttribute("href");
            let title = timeNode[0].parentNode.parentNode.getAttribute("aria-label");
            console.log(url)
            console.log(window.location.href)
            console.log(gCurrentUrl);
            if (window.location.href.indexOf(gCurrentUrl) >= 0) {
                console.log("find current url:"+url);
                // 找到了需要导出的分享。开始展开分享
                let expBtns = cN[idx].getElementsByClassName("UFIPagerLink");
                let moreBtns = cN[idx].getElementsByClassName("UFICommentLink");
                let skipCount = 0;
                console.log(expBtns.length);
                console.log(moreBtns.length);
                for (let idx = 0; idx < moreBtns.length; ++ idx){
                    console.log( moreBtns[idx].textContent);
                    console.log(moreBtns[idx].textContent.indexOf(Utils.getLangText("hidden")));
                    if (
                        moreBtns[idx].textContent.indexOf(Utils.getLangText("writeDiscuss")) >= 0
                        ||
                        moreBtns[idx].textContent.indexOf(Utils.getLangText("hidden")) >= 0
                    ){
                        moreBtns[idx] = 1;
                        console.log(moreBtns[idx]);
                        ++skipCount;
                    }
                }
                console.log(moreBtns);
                console.log(skipCount);
                if  (gNoEXpand || (expBtns.length == 0 && (moreBtns.length - skipCount) ==0)){
                    // 没有更多的内容需要展开，开始导出内容
                    if(findAllDataInPostContentualLayer(cN[idx])!= true){
                        console.log("findAllDataInPostContentualLayer has some error")
                        // 有报错，终止
                        autoExportNotReady('');
                    }
                }
                else{
                    console.log(expBtns);
                    console.log(moreBtns);
                    // 调用所有的展开按钮
                    for (let i = 0; i < expBtns.length; ++i){
                        dispatch(expBtns[i],'click');
                    }
                    for (let i = 0; i < moreBtns.length; ++i){
                        console.log(moreBtns[i].textContent);
                        console.log(moreBtns[i].textContent.indexOf(Utils.getLangText("writeDiscuss")));
                        console.log(moreBtns[i].textContent.indexOf(Utils.getLangText("hidden")));
                        if (
                            moreBtns[i].textContent.indexOf(Utils.getLangText("writeDiscuss")) >= 0
                            ||
                            moreBtns[i].textContent.indexOf(Utils.getLangText("hidden")) >= 0
                        ){
                            console.log("skip");
                        }
                        else{
                            dispatch(moreBtns[i],'click');
                        }
                    }
                    setTimeout(expansPostContent,1000,);
                }
                break;
            }
            else{
                // 找不到就跳过该页
                finishExport(null);
            }
        }
    }
}

// 展开适配分享的更多评论
function expansVideoPageContent(){
	let moreBtns = [];
	// 先把视频暂停

    let giftNode = document.getElementById("permalink_video_pagelet");
    if (giftNode){
        setTimeout(autoExportFinish,1000,null);
        // autoExportFinish(null);
        return;
    }

	let video = document.getElementsByTagName("video")[0];
	if (!video){
        // 如果界面沒有刷出來，則告訴後臺自動導出還沒有準備好，等待下次自動導出
        autoExportNotReady(null);
        return;
    }
    else{
        autoExportIsStared();
    }
	dispatch(video,'click');

	// 标签切换到评论
	let tabPL = document.getElementById("u_2_u");
	if (tabPL){

        tabPL = tabPL.getElementsByTagName("span");
        for (let idx = 0 ; idx < tabPL.length; ++idx){
            // console.log(tabPL[idx]);
            // console.log(tabPL[idx].innerText);
            if (tabPL[idx].textContent.indexOf(Utils.getLangText("discuss")) >= 0) {
                console.log("discuss");
                console.log("u_2_u");
                // console.log(tabPL[idx].parentNode);
                dispatch(tabPL[idx].parentNode,"click");

            }
        }
    }
    tabPL = document.getElementById("u_2_t");
	if (tabPL){

        tabPL = tabPL.getElementsByTagName("span");
        for (let idx = 0 ; idx < tabPL.length; ++idx){
            // console.log(tabPL[idx]);
            // console.log(tabPL[idx].innerText);
            if (tabPL[idx].textContent.indexOf(Utils.getLangText("discuss")) >= 0) {
                console.log("discuss");
                console.log("u_2_t");
                // console.log(tabPL[idx].parentNode);
                dispatch(tabPL[idx].parentNode,"click");
            }
        }
    }
	video.pause();
    // 更多评论
    let pLinkNodes = document.getElementsByClassName("UFIPagerLink");
    // console.log("pLinkNodes"+pLinkNodes.length);
    for(let pIdx = 0;pIdx < pLinkNodes.length; ++pIdx){
        if (pLinkNodes[pIdx].textContent.indexOf(Utils.getLangText("discussBefore")) < 0){
            moreBtns.push(pLinkNodes[pIdx]);
        }
    }
    // X条回复
    let replyNodes = document.getElementsByClassName("UFIReplyList");
    // console.log("replyNodes"+replyNodes.length);


    for(let rIdx = 0; rIdx < replyNodes.length; ++rIdx){
        let linkNodes = replyNodes[rIdx].getElementsByClassName("UFICommentLink");
        for (let lIdx = 0; lIdx < linkNodes.length; ++lIdx){
            if (linkNodes[lIdx].innerText.indexOf(Utils.getLangText("hidden")) < 0) {
                // 找不到"隐藏"的才是展开
                moreBtns.push(linkNodes[lIdx]);
            }
        }
    }
	// 展开
    let moreText = document.getElementsByClassName("fss");
    for (let idx = 0; idx < moreText.length; ++ idx){
	    moreBtns.push(moreText[idx]);
    }

    console.log(moreBtns);
	// console.log("moreBtns"+moreBtns.length);
	if ( gNoEXpand != true && moreBtns.length >0) {
		for(let idx = 0 ; idx < moreBtns.length; ++idx){
			dispatch(moreBtns[idx], 'click');
		}

        setTimeout(expansVideoPageContent,1000);
	}
	else{
		// console.log("expansVideoPageContent finish");

            if(findAllDataInVideoContextualLayer() !== true){
                autoExportNotReady('');
            }
	}

}

// 展開圖片分享的更多評論
function expansPhotoPageContent() {
	let moreBtns = [];
    let photoContent = document.getElementsByClassName("photoUfiContainer");
    if (!photoContent || photoContent.length <= 0) {
        console.log("photoUfiContainer not exist");
        // 如果界面沒有刷出來，則告訴後臺自動導出還沒有準備好，等待下次自動導出
        if (isAutoExport === true) {
            autoExportNotReady(null);
        }
    }
    else{
        autoExportIsStared();
        photoContent = document.getElementById("fbPhotoSnowliftFeedback");
        // photoContent = photoContent[0].getElementById("fbPhotoSnowliftFeedback");
        // 更多评论
        let morePage = photoContent.getElementsByClassName("UFIPagerLink");
        for (let mpIdx = 0; mpIdx < morePage.length; ++mpIdx){
            if (morePage[mpIdx].textContent === Utils.getLangText("moreDiscuss")) {
                moreBtns.push(morePage[mpIdx]);
            }
        }
        console.log(moreBtns.length);
        // 更多回复
        let moreContent = photoContent.getElementsByClassName("UFICommentLink");
        for (let mcIdx = 0; mcIdx < moreContent.length; ++mcIdx) {
            if (moreContent[mcIdx].textContent.indexOf(Utils.getLangText("hidden")) < 0){
                moreBtns.push(moreContent[mcIdx]);
            }
        }
        console.log(moreBtns.length);
        // 展开
        let moreText = photoContent.getElementsByClassName("fss");
        for (let idx = 0; idx < moreText.length; ++idx){
            moreBtns.push(moreText[idx]);
        }
        console.log(moreBtns.length);
        if ( gNoEXpand != true && moreBtns.length > 0){
            console.log(moreBtns);
        	for (let mbIdx = 0; mbIdx < moreBtns.length; ++ mbIdx){
        		dispatch(moreBtns[mbIdx],'click');
			}
			setTimeout(expansPhotoPageContent,1000);
		}
		else{

                if(findAllDataInPhotoContextualLayer() !== true){
                    autoExportNotReady('');
                }
		}
	}
}


// 在图片类分享页面查找数据
function findAllDataInPhotoContextualLayer(){
	// 获取所以分享的创建时间
	let contentNode = document.getElementById("fbPhotoSnowliftFeedback");
	let resData = [];
    if (gTitleData){
        resData.push(config.keys);
    }
	let line = new Array(config.keys.length);
    line[config.index.id] = 0;
    line[config.index.type] = "分享内容";
    line[config.index.localUrl] = window.location.href;
    // 尝试一种奇怪的赞
    let hasCheckedZanAndLike = false;
    let childCNode = contentNode.childNodes[0];
    console.log(contentNode);
    console.log(contentNode.childNodes);
    if (childCNode!= null && childCNode.classList.contains("fbPhotosSnowliftFeedback")) {
        let ccNodes = childCNode.childNodes;
        for (let i =0;i<ccNodes.length;++i){
            if (ccNodes[i].classList.contains("UFIContainer") !== true) {
                let likeAndShare = ccNodes[i].getElementsByTagName("a");
                for (let idxlNs = 0; idxlNs < likeAndShare.length; ++idxlNs){
                    let text = likeAndShare[idxlNs].getAttribute("aria-label");
                    // 如果能找到，就是赞
                    if (text){
                        if (text.indexOf(Utils.getLangText("zan")) >= 0) {
                            line[config.index.zan] = Utils.realNum(text)[0];
                        }
                        else if (text.indexOf(Utils.getLangText("daxin")) >= 0){
                            line[config.index.daxin] = Utils.realNum(text)[0];
                        }
                        else if (text.indexOf(Utils.getLangText("wa")) >= 0){
                            line[config.index.wa] = Utils.realNum(text)[0];
                        }
                        else if (text.indexOf(Utils.getLangText("ha")) >= 0){
                            line[config.index.ha] = Utils.realNum(text)[0];
                        }
                        else if (text.indexOf(Utils.getLangText("wu")) >= 0){
                            line[config.index.wu] = Utils.realNum(text)[0];
                        }
                        else if (text.indexOf(Utils.getLangText("nu")) >= 0){
                            line[config.index.nu] = Utils.realNum(text)[0];
                        }
                    }
                    else{
                        // 如果找不到，可能是评论和分享
                        text = likeAndShare[idxlNs].textContent;
                        if (text.indexOf(Utils.getLangText("share")) > 0){
                            line[config.index.shareTimes] = Utils.realNum(text)[0];
                        }
                        else if (text.indexOf(Utils.getLangText("discuss")) > 0){
                            line[config.index.discussTims] = Utils.realNum(text)[0];
                        }
                        else{
                            if (
                                text.indexOf(Utils.getLangText("share")) >= 0
                                || text.indexOf(Utils.getLangText("discuss")) >= 0
                                || text.indexOf(Utils.getLangText("zan")) >= 0
                            ) {
                                continue;
                            }
                            console.log(likeAndShare[idxlNs]);
                            // 都找不到那就是总赞
                            let num = Utils.realNum(likeAndShare[idxlNs].childNodes[0].textContent);
                            console.log(num);
                            num = num[0];
                            console.log(num);
                            if (num > 0){
                                line[config.index.totleLike] = num;
                            }
                        }
                    }
                }
                resData.push(line);
                // console.log(line);
                line[config.index.totleInteraction] = line[config.index.discussTims] + line[config.index.shareTimes] + line[config.index.totleLike];
                hasCheckedZanAndLike = true;
                break;
            }
        }
    }
    // 标题和内容
    let photoCaption = document.getElementById("fbPhotoSnowliftCaption");
    if (!photoCaption){
        console.log("fbPhotoSnowliftCaption not found");
        return false;
    }
    photoCaption = photoCaption.getElementsByClassName("hasCaption")[0];
    if (photoCaption){
        line[config.index.content] = Utils.realText(photoCaption.textContent);
    }
    let photoAuthorName = document.getElementById("fbPhotoSnowliftAuthorName");
    if (!photoAuthorName){
        console.log("fbPhotoSnowliftAuthorName not found");
        return false;
    }
    line[config.index.author] = Utils.realText(photoAuthorName.textContent);
    let photoTimestamp = document.getElementById("fbPhotoSnowliftTimestamp");
    if (!photoTimestamp){
        console.log("fbPhotoSnowliftTimestamp not found");
        return false;
    }
    let timeNode = photoTimestamp.getElementsByTagName("abbr")[0];
    let time = timeNode.getAttribute("title");
    time = Utils.getDateFromString(time);
    line[config.index.date] = time[0];
    line[config.index.time] = time[1];
	// 逐条分享
	let UFIList = contentNode.getElementsByClassName("UFIList");
	if (UFIList.length < 0 ){
	    console.log("UFIList is empty");
	    return false;
    }
    UFIList = UFIList[0].childNodes;
    if (UFIList.length < 0 ){
        console.log("UFIList child is empty");
        return false;
    }
    for (let uflIdx = 0; uflIdx < UFIList.length; ++ uflIdx){
        if (hasCheckedZanAndLike !== true && UFIList[uflIdx].classList.contains("UFILikeSentence")){
            console.log(UFIList[uflIdx]);
            // 总赞相关
            let likeAndZan = UFIList[uflIdx].getElementsByClassName("_ipp");
            // console.log(likeAndZan);
            if (likeAndZan && likeAndZan.length > 0) {
                let cNode = likeAndZan[0].childNodes[0].childNodes;
                // console.log(cNode);
                for(let cnIdx = 0; cnIdx < cNode.length; ++cnIdx){
                    // console.log("cNode[cnIdx].nodeName:"+cNode[cnIdx].nodeName);
                    if (cNode[cnIdx].nodeName === "SPAN") {
                        // 计算前三种心情
                        let cLNode = cNode[cnIdx].childNodes;
                        // console.log(cLNode);
                        if (cLNode) {

                            for(let clIdx = 0; clIdx < cLNode.length; ++clIdx){
                                let text = cLNode[clIdx].getAttribute("aria-label");
                                if (text.indexOf(Utils.getLangText("zan")) >= 0) {
                                    line[config.index.zan] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("daxin")) >= 0){
                                    line[config.index.daxin] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("wa")) >= 0){
                                    line[config.index.wa] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("ha")) >= 0){
                                    line[config.index.ha] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("wu")) >= 0){
                                    line[config.index.wu] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("nu")) >= 0){
                                    line[config.index.nu] = Utils.realNum(text)[0];
                                }
                            }
                        }
                    }
                    else if(cNode[cnIdx].nodeName === "A"){
                        // 总赞
                        line[config.index.totleLike] = Utils.realNum(cNode[cnIdx].childNodes[0].innerText)[0];
                    }
                }
            }
            else{
                // console.log("zan _ipp is empty");
                // return false;
            }
        }
        else if(hasCheckedZanAndLike !== true && UFIList[uflIdx].classList.contains("UFIShareRow")){
            // 分享和评论
            let node = UFIList[uflIdx].childNodes[0].childNodes;
            for (let nIdx = 0; nIdx < node.length; ++nIdx){
                let text = node[nIdx].textContent;
                if (text.indexOf(Utils.getLangText("share")) > 0){
                    line[config.index.shareTimes] = Utils.realNum(text)[0];
                }
                else if (text.indexOf(Utils.getLangText("discuss")) > 0){
                    line[config.index.discussTims] = Utils.realNum(text)[0];
                }
            }
            resData.push(line);
        }
        else if(UFIList[uflIdx].classList.contains("_j6a")){
            // 评论
            let CNodes = UFIList[uflIdx].childNodes[0].childNodes;
            for (let cnIdx = 0; cnIdx < CNodes.length; ++ cnIdx){
                if (CNodes[cnIdx].classList.contains("UFIComment")){
                    // 一级评论
                    let line = new Array(config.keys.length);
                    line[config.index.id] = resData.length;
                    line[config.index.type] = "一级评论";
                    // 评论的时间
                    let timeNode = CNodes[cnIdx].getElementsByClassName("livetimestamp")[0];
                    let time = timeNode.getAttribute("title");
                    time = Utils.getDateFromString(time);
                    line[config.index.date] = time[0];
                    line[config.index.time] = time[1];
                    // 有文字的回复
                    let actorAndBody = CNodes[cnIdx].getElementsByClassName("UFICommentActorAndBody");
                    actorAndBody = actorAndBody[0];
                    if (actorAndBody){

                        let c =  actorAndBody.childNodes;
                        if (c && c.length > 1) {
                            line[config.index.author] = Utils.realText(c[0].textContent);
                            // console.log(c[1].nodeName);
                            if (c[1].nodeName === "#text") {
                                line[config.index.content] = Utils.realText(c[2].textContent);
                            }
                            else{
                                line[config.index.content] = Utils.realText(c[1].textContent);
                            }
                        }
                    }
                    // 只有表情的回复

                    // 各种赞
                    let blingNodes = CNodes[cnIdx].getElementsByClassName("UFICommentReactionsBling");
                    blingNodes = blingNodes[0];
                    if (blingNodes){
                        blingNodes = blingNodes.getElementsByTagName("span");
                        for (let bIdx = 0; bIdx < blingNodes.length; ++ bIdx){
                            if (blingNodes[bIdx].classList.contains("UFISutroLikeCount")){
                                // 总赞
                                line[config.index.totleLike] = Utils.realNum(blingNodes[bIdx].textContent)[0];
                            }
                            else {
                                // 各自的赞
                                let text = blingNodes[bIdx].getAttribute("aria-label");
                                if (!text){
                                    console.log(blingNodes[bIdx]);
                                    continue;
                                }
                                if (text.indexOf(Utils.getLangText("zan")) >= 0) {
                                    line[config.index.zan] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("daxin")) >= 0){
                                    line[config.index.daxin] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("wa")) >= 0){
                                    line[config.index.wa] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("ha")) >= 0){
                                    line[config.index.ha] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("wu")) >= 0){
                                    line[config.index.wu] = Utils.realNum(text)[0];
                                }
                                else if (text.indexOf(Utils.getLangText("nu")) >= 0){
                                    line[config.index.nu] = Utils.realNum(text)[0];
                                }
                            }
                        }
                    }

                    console.log(line);
                    resData.push(line);
                }
                else if(CNodes[cnIdx].classList.contains("UFIReplyList")){
                    // 二级评论
                    let l2CNode = CNodes[cnIdx].getElementsByClassName("UFIComment");
                    for (let l2cnIdx = 0; l2cnIdx < l2CNode.length; ++l2CNode){
                        let line = new Array(config.keys.length);
                        line[config.index.id] = resData.length;
                        line[config.index.type] = "二级评论";
                        // 评论的时间
                        let timeNode = l2CNode[l2cnIdx].getElementsByClassName("livetimestamp")[0];
                        let time = timeNode.getAttribute("title");
                        time = Utils.getDateFromString(time);
                        line[config.index.date] = time[0];
                        line[config.index.time] = time[1];
                        // 文字回复
                        let actorAndBody = l2CNode[l2cnIdx].getElementsByClassName("UFICommentActorAndBody")[0];
                        if (actorAndBody){
                            let c =  actorAndBody.childNodes;
                            if (c && c.length > 1) {
                                line[config.index.author] = Utils.realText(c[0].textContent);
                                // console.log(c[1].nodeName);
                                if (c[1].nodeName === "#text") {
                                    line[config.index.content] = Utils.realText(c[2].textContent);
                                }
                                else{
                                    line[config.index.content] = Utils.realText(c[1].textContent);
                                }
                            }
                        }
                        // 表情回复

                        // 各种赞
                        let blingNodes = l2CNode[l2cnIdx].getElementsByClassName("UFICommentReactionsBling");
                        blingNodes = blingNodes[0];
                        if (blingNodes){
                            blingNodes = blingNodes.getElementsByTagName("span");
                            for (let bIdx = 0; bIdx < blingNodes.length; ++ bIdx){
                                if (blingNodes[bIdx].classList.contains("UFISutroLikeCount")){
                                    // 总赞
                                    line[config.index.totleLike] = Utils.realNum(blingNodes[bIdx].textContent)[0];
                                }
                                else {
                                    // 各自的赞
                                    let text = blingNodes[bIdx].getAttribute("aria-label");
                                    if (!text){
                                        console.log(blingNodes[bIdx]);
                                        continue;
                                    }
                                    if (text.indexOf(Utils.getLangText("zan")) >= 0) {
                                        line[config.index.zan] = Utils.realNum(text)[0];
                                    }
                                    else if (text.indexOf(Utils.getLangText("daxin")) >= 0){
                                        line[config.index.daxin] = Utils.realNum(text)[0];
                                    }
                                    else if (text.indexOf(Utils.getLangText("wa")) >= 0){
                                        line[config.index.wa] = Utils.realNum(text)[0];
                                    }
                                    else if (text.indexOf(Utils.getLangText("ha")) >= 0){
                                        line[config.index.ha] = Utils.realNum(text)[0];
                                    }
                                    else if (text.indexOf(Utils.getLangText("wu")) >= 0){
                                        line[config.index.wu] = Utils.realNum(text)[0];
                                    }
                                    else if (text.indexOf(Utils.getLangText("nu")) >= 0){
                                        line[config.index.nu] = Utils.realNum(text)[0];
                                    }
                                }
                            }
                        }

                        console.log(line);
                        resData.push(line);

                    }
                }
            }
        }
    }

    console.log(resData);
    // exportCVSFile(resData);
    finishExport(resData);
    return true;
}

// 在影片类分享页面查找数据
function findAllDataInVideoContextualLayer(){
	// console.log("findAllDataInVideoContextualLayer");
	let rootNode = document.getElementsByClassName("_5-g-");
	// console.log(rootNode);
	let resData = [];
    if (gTitleData){
        resData.push(config.keys);
    }

	if (rootNode && rootNode.length > 0) {
		let cDiv = rootNode[0].childNodes;
		// // console.log(cDiv);
		if (cDiv && cDiv.length > 1) {
			let line = new Array(config.keys.length);
			line[config.index.id] = resData.length;
			line[config.index.type] = "分享内容";
			line[config.index.localUrl] = window.location.href;
			// 左侧节点是视频
			let leftNode = cDiv[0];
			let video = leftNode.getElementsByTagName("video")[0];
			if (!video){
			    console.log('video is empty');
			    return false;
            }
			line[config.index.videoUrl] = Utils.realText(video.getAttribute("src"));
			// 右侧节点是回复和分享原文
			let rightNode = cDiv[1];
			// 查找分享正文
			rightNode = rightNode.getElementsByClassName("collapsible_comments");
			if (!rightNode){
			    console.log("collapsible_comments is empty");
			    return false;
            }
			// // console.log(leftNode);
			if (rightNode.length > 0) {
				rightNode = rightNode[0];
				// 发布时间
				let timeNode = rightNode.getElementsByClassName("timestamp")[0];
				let time = timeNode.getAttribute("title");
				time = Utils.getDateFromString(time);
				line[config.index.date] = time[0];
				line[config.index.time] = time[1];

				let headNode = rightNode.getElementsByClassName("_1rgv");
				// console.log(headNode);
				if (headNode && headNode.length > 0) {
					// 查找标题
                    let titleNode = headNode[0].getElementsByClassName("_1rgw");
					// console.log("titleNode"+titleNode.length);
					if (titleNode && titleNode.length > 0) {
						let titleStr = titleNode[0].innerText;
						// console.log("titleStr"+titleStr);
						line[config.index.title] = Utils.realText(titleStr);
					}
					// 查找内容
                    let contentNode = headNode[0].getElementsByClassName("_1rg-");
					// console.log("contentNode"+contentNode.length);
					if (contentNode && contentNode.length > 0) {
						let contentStr = contentNode[0].innerText;
						// console.log("contentStr"+contentStr);
						line[config.index.content] =  Utils.realText(contentStr);
					}
				}
				// 统计数据
				let statisticsNode = rightNode.getElementsByClassName("_6599");
				if (statisticsNode && statisticsNode.length > 0) {
					let shareAndPlay = statisticsNode[0].getElementsByClassName("_ipo");
					if (shareAndPlay && shareAndPlay.length > 0) {
						let cNode = shareAndPlay[0].childNodes;
						for (let cnIdx = 0; cnIdx < cNode.length; ++cnIdx){
							let text = cNode[cnIdx].innerText;
							if (text.indexOf(Utils.getLangText("shareTimes")) >= 0) {
								line[config.index.shareTimes] = Utils.realNum(text)[0];
							}
							else if(text.indexOf(Utils.getLangText("playTimes")) >= 0){
								line[config.index.playTimes] = Utils.realNum(text)[0];
							}
						}
					}
					let likeAndZan = statisticsNode[0].getElementsByClassName("_ipp");
					// console.log(likeAndZan);
					if (likeAndZan && likeAndZan.length > 0) {
						let cNode = likeAndZan[0].childNodes[0].childNodes;
						// console.log(cNode);
						for(let cnIdx = 0; cnIdx < cNode.length; ++cnIdx){
							// console.log("cNode[cnIdx].nodeName:"+cNode[cnIdx].nodeName);
							if (cNode[cnIdx].nodeName === "SPAN") {
								// 计算前三种心情
								let cLNode = cNode[cnIdx].childNodes;
								// console.log(cLNode);
								if (cLNode) {

									for(let clIdx = 0; clIdx < cLNode.length; ++clIdx){
										let text = cLNode[clIdx].getAttribute("aria-label");
										if (text.indexOf(Utils.getLangText("zan")) >= 0) {
											line[config.index.zan] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("daxin")) >= 0){
											line[config.index.daxin] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("wa")) >= 0){
											line[config.index.wa] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("ha")) >= 0){
											line[config.index.ha] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("wu")) >= 0){
											line[config.index.wu] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("nu")) >= 0){
											line[config.index.nu] = Utils.realNum(text)[0];
										}
									}
								}
							}
							else if(cNode[cnIdx].nodeName === "A"){
								// 总赞
								line[config.index.totleLike] = Utils.realNum(cNode[cnIdx].innerText)[0];
							}
						}
					}
				}
				else{
				    console.log("_6899 is empty");
				    return false;
                }

                // 评论条数
                let discussNode = document.getElementsByClassName("UFILastCommentComponent")[0];
				if  (discussNode)
                {
                    discussNode = discussNode.getElementsByClassName("UFIPagerCount")[0];
                    if (discussNode){
                        let discussCount = discussNode.textContent.split("/")
                        if (discussCount.length > 1){
                            discussCount = discussCount[1];
                            line[config.index.discussTims] = Utils.realNum(discussCount)[0];
                        }
                    }
                }

                let videoTime = leftNode.getElementsByClassName("_5qsr")[0];
                // 直播，放弃导出
                if (videoTime){
                    line[config.index.videoTime] = Utils.sec2time(Utils.realNum(videoTime.getAttribute("playbackdurationtimestamp"))[0]);
                }
                line[config.index.totleInteraction] = line[config.index.discussTims] + line[config.index.shareTimes] + line[config.index.totleLike];
				resData.push(line);
				if (!videoTime){
                    autoExportFinish(resData);
                    return true;
                }
				// console.log("title");
				// console.log(resData);
				// 评论
                if (document.getElementsByClassName("UFIList").length <= 0
                    ||  document.getElementsByClassName("UFIList")[0]
                    .getElementsByClassName("_j6a")[0] === null
                    || document.getElementsByClassName("UFIList")[0]
                        .getElementsByClassName("_j6a")[0].childNodes[0] === null
                )
                {
                    console.log("UFIList or child is empty");
                    return false;
                }
				let discussList = document.getElementsByClassName("UFIList")[0]
					.getElementsByClassName("_j6a")[0].childNodes[0].childNodes;
				// console.log(document.getElementsByClassName("UFIList").length);
				// console.log(document.getElementsByClassName("UFIList")[0]
				// 	.getElementsByClassName("_j6a").length);

				// console.log(document.getElementsByClassName("UFIList")[0]
				// 	.getElementsByClassName("_j6a")[0].childNodes.length);

				// console.log(document.getElementsByClassName("UFIList")[0]
				// 	.getElementsByClassName("_j6a")[0].childNodes[0].childNodes.length);

				for(let discussIdx = 0; discussIdx < discussList.length; ++discussIdx){

					let line = new Array(config.keys.length);
					line[config.index.id] = resData.length;
					// 一级评论
					if (discussList[discussIdx].classList.contains("UFIComment")) {
						line[config.index.type] = "一级评论";
						// 文字评论
						let  UFICommentActorAndBody = discussList[discussIdx]
							.getElementsByClassName("UFICommentActorAndBody");
							// console.log("UFICommentActorAndBody");
							// console.log(UFICommentActorAndBody);
						if ( UFICommentActorAndBody &&  UFICommentActorAndBody.length > 0) {
							 UFICommentActorAndBody =  UFICommentActorAndBody[0];
							 let c =  UFICommentActorAndBody.childNodes;
							 if (c && c.length > 1) {
							 	line[config.index.author] = Utils.realText(c[0].textContent);
							 	// console.log(c[1].nodeName);
							 	if (c[1].nodeName === "#text") {
							 		line[config.index.content] = Utils.realText(c[2].textContent);
							 	}
							 	else{
							 		line[config.index.content] = Utils.realText(c[1].textContent);
							 	}
							 }
						}
						// 图片评论
						// 视频评论
						// 点赞
						let likeAndZan = discussList[discussIdx]
							.getElementsByClassName("UFICommentReactionsBling")[0];
						if ( likeAndZan && likeAndZan.childNodes && likeAndZan.childNodes.length > 1) {
							let eachZan = likeAndZan.childNodes[0];
							if (eachZan && eachZan.childNodes) {

								for(let ezIdx = 0; ezIdx < eachZan.childNodes.length; ++ezIdx){
									let text = eachZan.childNodes[ezIdx].getAttribute("aria-label");
									if (text.indexOf(Utils.getLangText("zan")) >= 0) {
										line[config.index.zan] = Utils.realNum(text)[0];
									}
									else if (text.indexOf(Utils.getLangText("daxin")) >= 0){
										line[config.index.daxin] = Utils.realNum(text)[0];
									}
									else if (text.indexOf(Utils.getLangText("wa")) >= 0){
										line[config.index.wa] = Utils.realNum(text)[0];
									}
									else if (text.indexOf(Utils.getLangText("ha")) >= 0){
										line[config.index.ha] = Utils.realNum(text)[0];
									}
									else if (text.indexOf(Utils.getLangText("wu")) >= 0){
										line[config.index.wu] = Utils.realNum(text)[0];
									}
									else if (text.indexOf(Utils.getLangText("nu")) >= 0){
										line[config.index.nu] = Utils.realNum(text)[0];
									}
								}
							}
							let totleLike = likeAndZan.childNodes[1];
							// // console.log("totleLike.innerText"+totleLike.textContent);
							line[config.index.totleLike] = Utils.realNum(totleLike.textContent)[0];
						}
						else{
							line[config.index.totleLike] = 0;
						}
						// 恢复时间
						let timeNode =  discussList[discussIdx]
							.getElementsByClassName("livetimestamp")[0];
						let time = timeNode.getAttribute("title");
						time = Utils.getDateFromString(time);
						line[config.index.date] = time[0];
						line[config.index.time] = time[1];
						// console.log(line);
						resData.push(line);
					}
					// 二级评论
					else if (discussList[discussIdx].classList.contains("UFIReplyList"))
					{
						// 找到全部的二级回复结构
						let  UFINode = discussList[discussIdx]
							.getElementsByClassName("UFICommentContentBlock");
						for ( let stIdx = 0; stIdx < UFINode.length; ++stIdx ){
							let line = new Array(config.keys.length);
							line[config.index.id] = resData.length;
							line[config.index.type] = "二级评论";
							// 回复内容
							// 文字评论
							let contentNode = UFINode[stIdx]
								.getElementsByClassName("UFICommentActorAndBody")[0];

							if (contentNode && contentNode.childNodes) {

								let c =  contentNode.childNodes;
								if (c && c.length > 1) {
								 	line[config.index.author] = Utils.realText(c[0].textContent);
								 	// console.log(c[1].nodeName);
								 	if (c[1].nodeName === "#text") {
								 		line[config.index.content] = Utils.realText(c[2].textContent);
								 	}
								 	else{
								 		line[config.index.content] = Utils.realText(c[1].textContent);
								 	}
								}
							}
							// 图片评论
							// 赞
							let likeAndZan = UFINode[stIdx]
								.getElementsByClassName("UFICommentReactionsBling")[0];
							if (likeAndZan && likeAndZan.childNodes && likeAndZan.childNodes.length > 1) {
								let eachZan = likeAndZan.childNodes[0];
								if (eachZan && eachZan.childNodes) {

									for(let ezIdx = 0; ezIdx < eachZan.childNodes.length; ++ezIdx){
										let text = eachZan.childNodes[ezIdx].getAttribute("aria-label");
										if (text.indexOf(Utils.getLangText("zan")) >= 0) {
											line[config.index.zan] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("daxin")) >= 0){
											line[config.index.daxin] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("wa")) >= 0){
											line[config.index.wa] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("ha")) >= 0){
											line[config.index.ha] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("wu")) >= 0){
											line[config.index.wu] = Utils.realNum(text)[0];
										}
										else if (text.indexOf(Utils.getLangText("nu")) >= 0){
											line[config.index.nu] = Utils.realNum(text)[0];
										}
									}
								}
								let totleLike = likeAndZan.childNodes[1];
								// // console.log("totleLike.innerText"+totleLike.textContent);
								line[config.index.totleLike] = Utils.realNum(totleLike.textContent)[0];
							}
							else{
								line[config.index.totleLike] = 0;
							}
							// 回复时间
							let timeNode = UFINode[stIdx].getElementsByClassName("livetimestamp")[0];
							let time = Utils.realText(timeNode.getAttribute("title"));
							time = Utils.getDateFromString(time);
							line[config.index.date] = time[0];
							line[config.index.time] = time[1];
							resData.push(line);
						}
					}
				}
				//
			}

		}
	}
	// console.log(resData);
	// exportCVSFile(resData);
    finishExport(resData);
	return true;
}

// 在post类型的页面中查找数据，已知的有照片墙
function findAllDataInPostContentualLayer(element) {
    let shareText = element.getElementsByClassName("userContent");
    console.log(shareText);
    console.log(shareText.length);
    let resData = [];
    if (gTitleData){
        resData.push(config.keys);
    }
    let line = new Array(config.keys.length);
    line[config.index.id] = 0;
    line[config.index.type] = "分享内容";
    line[config.index.localUrl] = window.location.href;
    if (shareText.length > 0) {
        shareText = shareText[0];
        console.log(shareText);
        line[config.index.content] = Utils.realText(shareText.innerText);
    }
    let timeNode = element.getElementsByClassName("timestampContent");
    console.log(timeNode);
    timeNode = Utils.getDateFromString(timeNode[0].parentNode.getAttribute("title"));
    console.log(timeNode);
    if (timeNode.length == 2){
        line[config.index.date] = timeNode[0];
        line[config.index.time] = timeNode[1];
    }
    else {
        console.log("error time format");
        console.log(timeNode);
    }
    let likeAndShare = element.getElementsByClassName("_ipp")[0];
    likeAndShare = likeAndShare.childNodes[0];
    let checkStr = "";
    likeAndShare = likeAndShare.getElementsByTagName("a");
    console.log(likeAndShare);
    for (var idx = 0; idx < likeAndShare.length; ++idx){
        checkStr = likeAndShare[idx].getAttribute("aria-label");
        if (checkStr){
            line = Utils.likeCheckAndPutInLine(
                checkStr
                ,Utils.realNum(
                    likeAndShare[idx].textContent
                )[0]
                ,line
            )
        }
        else{

            if (likeAndShare[idx] && likeAndShare[idx].childNodes && likeAndShare[idx].childNodes[0]){
                line[config.index.totleLike] = Utils.realNum(likeAndShare[idx].childNodes[0].textContent)[0];
            }
        }
    }
    let shareAndDiscuss = element.getElementsByClassName("_ipo")[0];
    shareAndDiscuss = shareAndDiscuss.getElementsByTagName("a");
    for (var idx = 0;idx < shareAndDiscuss.length; ++ idx){
        line = Utils.shareCheckAndPutInLine(shareAndDiscuss[idx].textContent,line);
    }

    line[config.index.totleInteraction] = line[config.index.discussTims] + line[config.index.shareTimes] + line[config.index.totleLike];
    resData.push(line);
    console.log(line);
    // return false;
    console.log(element.getElementsByClassName("UFIList"));
    // 完成标题的导出
    let UFIList = element.getElementsByClassName("UFIList");
    if (UFIList.length <= 0){
        autoExportNotReady(null);
        return false;
    }
    UFIList = UFIList[0].childNodes;
    for (var idx = 0; idx < UFIList.length; ++ idx){
        if (UFIList[idx].classList.contains("UFIRow") != true && UFIList[idx].classList.contains("accessible_elem") != true) {
            // 都不是，那就是反馈们了
            let cNodeList = UFIList[idx].childNodes[0].childNodes;
            for (var cIdx = 0;cIdx < cNodeList.length;++cIdx){
                if (cNodeList[cIdx].classList.contains("UFIReplyList")){
                    // 二级评论
                    console.log("level 2");
                    let UFIComment = cNodeList[cIdx].getElementsByClassName("UFIComment ");
                    console.log(UFIComment);
                    for (var rIdx = 0; rIdx < UFIComment.length; ++ rIdx){
                        line = new Array(config.keys.length);
                        line[config.index.id] = resData.length;
                        line[config.index.type] = "二级评论";
                        let UFICommentActorAndBody = UFIComment[rIdx].getElementsByClassName("UFICommentActorAndBody");
                        console.log(UFICommentActorAndBody)
                        // 有名字有分享
                        if (UFICommentActorAndBody.length > 0){
                            let  UFICommentActorName = UFICommentActorAndBody[0].getElementsByClassName("UFICommentActorName")[0];
                            line[config.index.author] = UFICommentActorName.textContent;
                            let UFICommentBody = UFICommentActorAndBody[0].getElementsByClassName("UFICommentBody")[0];
                            line[config.index.content] = UFICommentBody.textContent;
                        }
                        let UFICommentReactionsBling = UFIComment[rIdx].getElementsByClassName("UFICommentReactionsBling ");
                        console.log(UFICommentReactionsBling);
                        if (UFICommentReactionsBling .length > 0){
                            let likeAndShare = UFICommentReactionsBling[0].getElementsByTagName("span");
                            for (var lsIdx = 0; lsIdx < likeAndShare.length; ++lsIdx){
                                let text = likeAndShare[lsIdx].getAttribute("aria-label");
                                let val = Utils.realNum(text);
                                console.log(text);
                                console.log(val);
                                if (val){
                                    line = Utils.likeCheckAndPutInLine(
                                        text
                                        ,val[0]
                                        ,line
                                    )
                                }
                            }
                            let UFISutroLikeCount = UFICommentReactionsBling[0].getElementsByClassName("UFISutroLikeCount")[0];
                            console.log(UFISutroLikeCount);
                            line[config.index.totleLike] = Utils.realNum(UFISutroLikeCount.textContent)[0];
                        }
                        resData.push(line);
                    }
                }
                else if(cNodeList[cIdx].classList.contains("UFIComment")){
                    // 一级评论
                    console.log(cNodeList[cIdx]);
                    line = new Array(config.keys.length);
                    line[config.index.id] = resData.length;
                    line[config.index.type] = "一级评论";

                    let  UFICommentActorAndBody = cNodeList[cIdx].getElementsByClassName(" UFICommentActorAndBody");
                    // 有名字有分享
                    if (UFICommentActorAndBody.length > 0){
                        let UFICommentActorName  = UFICommentActorAndBody[0].getElementsByClassName(" UFICommentActorName")[0];
                        line[config.index.author] = UFICommentActorName.textContent;
                        let UFICommentBody = UFICommentActorAndBody[0].getElementsByClassName("UFICommentBody")[0];
                        line[config.index.content] = UFICommentBody.textContent;
                    }
                    // 赞和分享
                    let UFICommentReactionsBling = cNodeList[cIdx].getElementsByClassName("UFICommentReactionsBling");
                    if (UFICommentReactionsBling.length > 0){
                        let likeAndShare = UFICommentReactionsBling[0].getElementsByTagName("span");
                        for (var lsIdx = 0; lsIdx < likeAndShare.length; ++lsIdx){
                            let text = likeAndShare[lsIdx].getAttribute("aria-label");
                            let val = Utils.realNum(text);
                            if (val){
                                line = Utils.likeCheckAndPutInLine(
                                    text
                                    ,val[0]
                                    ,line
                                )
                            }
                        }
                        let UFISutroLikeCount = UFICommentReactionsBling[0].getElementsByClassName("UFISutroLikeCount")[0];
                        console.log(UFISutroLikeCount);
                        line[config.index.totleLike] = Utils.realNum(UFISutroLikeCount.textContent)[0];

                    }
                    resData.push(line);
                }
            }

        }
        else{

        }
    } 

    console.log(resData);
    finishExport(resData);
    return true;
}

// 自动导出状态相关

// 完成自动导出
function autoExportFinish(resData){
	if (isAutoExport){
	    if (resData === null){
	        resData = [];
	        if (gTitleData){
                resData.push(config.keys);
            }
	        let line = new Array(config.keys.length);
	        line[config.index.type]="跳过";
	        line[config.index.localUrl] = window.location.href;
	        resData.push(line);
        }
		isAutoExport = false;
        sendMsg('finishExport',resData);
        setTimeout(closeWindow,1);
        // closeWindow();
        // window.open(window.location.href, "_self").close();
    }
}

// 关闭页面
function closeWindow() {
    console.log("close");
    window.location.href="about:blank";isExporting = false;
    window.close();
}

// 开始自动导出
function autoExportStart(){
    console.log(isAutoExport);
    if (isAutoExport !== true){
        isAutoExport = true;
        if (window.location.href.indexOf("video")>0){
            expansVideoPageContent();
        }
        else if(window.location.href.indexOf("photos") > 0){
            expansPhotoPageContent()
        }
        else if (window.location.href.indexOf("posts") > 0){
            expansPostContent();
            // setTimeout(autoExportFinish,5000);
            // autoExportFinish();// 照片墙有问题
        }
        else{
            // 这个页面没有需要导出的东西，跳过
            // autoExportFinish();
            setTimeout(autoExportFinish,5000);
        }
    }
}

// 自动导出还没有准备好
function autoExportNotReady(data){
    console.log("autoExportNotReady");
    console.log(isAutoExport);
    if (isAutoExport === true){
        isAutoExport = false;
        sendMsg("ExportNotReady",data);
    }
}

// 自动导出已经开始
function autoExportIsStared() {
    console.log("autoExportIsStared");
    console.log(isAutoExport);
    sendMsg("autoExportIsStared","");
}


// 完成导出
function finishExport(resData){
    // console.error(resData);
    // return;
    autoExportFinish(resData);
}

// 自动导出状态相关结束

// 通讯接口
window.addEventListener('message',function(e){
    if (e.data.cmd === 'startExport'){
        // console.log("inject get message:")
        // console.log(e);
        gNoEXpand = e.data.needExpand !== true;
        // console.log(gNoEXpand);
        gTitleData = e.data.titleData;
        gCurrentUrl = e.data.targetURL;
        autoExportStart();
    }
    else if (e.data.cmd === "reStartExport"){
        gTitleData = e.data.titleData;
        gNoEXpand = e.data.needExpand !== true;
        gCurrentUrl = e.data.targetURL;
        isAutoExport = false;
        autoExportStart();
    }
    else if (e.data.cmd === "autoExportWithDataRange"){
        console.log("autoExportWithDataRange");
        console.log(e.data);
        gNoEXpand = e.data.needExpand !== true;
        gCurrentUrl = e.data.targetURL;
        // 根据传入的时间获得需要导出的全部链接，并开始导出
        if (e.data.data && e.data.data.startTime !== null && e.data.data.endTime  !== null ){

            if (isAutoExport == false){
                isAutoExport = true;
                autoExportIsStared();
                if (e.data.data.startTime == 0){
                    findUrlInShowm();
                }
                else{
                    findAllUrl(e.data.data.startTime,e.data.data.endTime);
                }

            }
        }
        else{
            console.log(e.data);
        }
    }
    else if (e.data.cmd === "ignore"){
        ignore();
    }
},false);

// 发送事件到工具后台
function sendMsg(cmd,data) {
    window.postMessage({
        cmd:cmd,
        data:data
    },'*');
}

// 发送界面事件
function dispatch(el, type){
    try{
        let evt = document.createEvent('Event');
        evt.initEvent(type,true,true);
        el.dispatchEvent(evt);
    }catch(e){alert(e);}
}

// 通讯接口结束

// 导出接口：

// 找到所以分享的url
function findAllUrl(startTime=null,endTime=null) {
    console.log(startTime)
    console.log(endTime);
    if (!startTime||startTime === 0) {
        alert("start time is null");
        return false;
    }
    if (!endTime || endTime === 0) {
        alert("end time is null");
        return false;
    }
    // 倒叙查找，开始要大于结束
    if (startTime < endTime) {
        let t = startTime;
        startTime = endTime;
        endTime = t;
    }
    console.log(startTime)
    console.log(endTime);
    startTime = Utils.getTimestamp(startTime);
    // 开始时加一天
    startTime = startTime + 60 * 60 * 24;
    endTime = Utils.getTimestamp(endTime)
    findAllFeedBack(startTime,endTime,function () {
        // 分享的内容
        let resData = [];
        let cN = document.getElementsByClassName("userContentWrapper");
        for (let idx = 0; idx < cN.length; ++idx){
            let timeNode = cN[idx].getElementsByClassName("timestampContent");
            if (timeNode && timeNode[0] && timeNode[0].parentNode && timeNode[0].parentNode.parentNode && timeNode[0].parentNode.parentNode.nodeName === "A"){
                let url =  timeNode[0].parentNode.parentNode.getAttribute("href");
                let title = timeNode[0].parentNode.parentNode.getAttribute("aria-label");
                let time = timeNode[0].parentNode.getAttribute("data-utime");
                console.log(time);
                if (time < startTime && time > endTime){
                    resData.push({
                        url : url,
                        title : title,
                        time : time,
                    });
                }
            }
        }
        console.log(resData);
        sendMsg("StartExportPerPage",{allUrl:resData,});
    });

}

function findUrlInShowm() {
    let resData = [];
    let cN = document.getElementsByClassName("userContentWrapper");
    for (let idx = 0; idx < cN.length; ++idx){
        let timeNode = cN[idx].getElementsByClassName("timestampContent");
        if (timeNode && timeNode[0] && timeNode[0].parentNode && timeNode[0].parentNode.parentNode && timeNode[0].parentNode.parentNode.nodeName === "A"){
            let url =  timeNode[0].parentNode.parentNode.getAttribute("href");
            let title = timeNode[0].parentNode.parentNode.getAttribute("aria-label");
            let time = timeNode[0].parentNode.getAttribute("data-utime");
            resData.push({
                url : url,
                title : title,
                time : time,
            });
        }
    }
    console.log(resData);
    sendMsg("StartExportPerPage",{allUrl:resData,});
}

// 跳过自动导出
function ignore() {
    console.log("ignore");
    isAutoExport = true;
    autoExportFinish(null);
    isAutoExport = false;
}

// 导出接口结束