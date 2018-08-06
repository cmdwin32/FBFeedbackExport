class Utils{

    // 从内存中下载文件 不能下载大文件
    static download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };
    // 剔除回车和控制字符
    static realText (text){
        return text.replace(/[\r\n]/g,"").replace(/,/g,"，");
    }
    // 获得数字文字
    static strNum  (text){
        if (text.indexOf(getLangText("wan")) > 0) {
            text = text.replace(/,/g,"");
            text = text.match(/\d+/g).map(Number);
            text = text.join('.');
            text = text + "W";
            // text = text[0]*10000+text[1]*1000;
            return [text]
        }
        return text.replace(/,/g,"");
    }
    // 从文字中找到数字
    static realNum (text){
        if (!text){
            return [0];
        }
        // console.log(text);
        // console.log(text.replace(/,/g,""));
        // console.log(getLangText("wan"));
        // console.log(text.indexOf(getLangText("wan")));
        if (text.indexOf(getLangText("wan")) > 0) {
            text = text.replace(/,/g,"");
            text = text.match(/\d+/g).map(Number);
            // text = text.join('.');
            // text = text + "W";
            // console.log(text)
            text = text[0]*10000;
            if (text.length > 1 ){
                text += text[1]*1000;
            }
            // console.log(text);
            return [text];
        }
        // // console.log(text.replace(/,/g,"").match(/\d+/g).map(Number));
        let res = text.replace(/,/g,"").match(/\d+/g);
        if (res){
            return res.map(Number);
        }
        else{
            return [0];
        }
    }
    static sec2time  (s) {
        let t;
        if(s > -1){
            let hour = Math.floor(s/3600);
            let min = Math.floor(s/60) % 60;
            let sec = s % 60;
            if (hour > 0) {
                if(hour < 10) {
                    t = '0'+ hour + ":";
                } else {
                    t = hour + ":";
                }
            }
            else{
                t = "00:";
            }

            if(min < 10){t += "0";}
            t += min + ":";
            if(sec < 10){t += "0";}
            t += sec.toFixed(0);
        }
        return t;
    }
    // 获得翻译过的文字
    static getLangText (key){
        if (config && config.langauge && config.langType && config.langauge[config.langType]){
            return config.langauge[config.langType][key];
        }
        else{
            return "";
        }
    }
    // 秒到时间的转换
    static sec2time  (s) {
        let t;
        if(s > -1){
            let hour = Math.floor(s/3600);
            let min = Math.floor(s/60) % 60;
            let sec = s % 60;
            if (hour > 0) {
                if(hour < 10) {
                    t = '0'+ hour + ":";
                } else {
                    t = hour + ":";
                }
            }
            else{
                t = "00:";
            }

            if(min < 10){t += "0";}
            t += min + ":";
            if(sec < 10){t += "0";}
            t += sec.toFixed(0);
        }
        return t;
    }
    // 从Data中获得时间戳
    static getTimestamp  (date){
        if (typeof  date === "number" || date instanceof  Number){
            return date;
        }
        if (typeof date === 'string' || date instanceof String){
            date = date.replace(/'-'/g,'/');
            date = new Date(date);
        }
        let d = new Date();
        let n = d.getTimezoneOffset();
        console.log(date);
        return Math.round(date.getTime()/1000)+n * 60; //先获得utc时间，然后根据本地的时区差值，计算本地时间
    }
    static getDateFromString(str){
        console.log("getDateFromString");
        console.log(str);
        if (str.indexOf("日 ") <0 ){
            str = str.replace("日","日 ")
        }
        return str.split(' ');
    }
    static likeCheckAndPutInLine(key,value,line){
        console.log("likeCheckAndPutInLine");
        console.log(key);
        console.log(value);
        if (!key || !value){
            return line;
        }
        for (var idx = config.index.zan;idx <= config.index.nu;++idx){
            if (key.indexOf(config.keys[idx]) > 0){
                line[idx] = value;
                break;
            }
        }
        console.log(line);
        return line;
    }

    static  shareCheckAndPutInLine(str,line){
        console.log("shareCheckAndPutInLine");
        console.log(str);
        if (str.indexOf(getLangText("share"))>0) {
            line[config.index.shareTimes] = Utils.realNum(str)[0];
        }
        else if(str.indexOf(getLangText("discuss")) > 0 ){
            line[config.index.discussTims] = Utils.realNum(str)[0];
        }
        console.log(line);
        return line;
    }
}