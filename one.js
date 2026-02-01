[rewrite_local]
# 广告
^https?:\/\/(api|jmtp)(.*-uat)?\.\w+\.com\/v2.5\/(bootstrap|user\/login|user\/avatarFrame|article\/discovery|navigation|ad\/space|my\/userExtraInfo) url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/One1222.js
# 解锁
^https?:\/\/(api|jmtp)(.*-uat)?\.\w+\.com\/v2.5\/(article\/detail) url script-request-header https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/One1222.js

[mitm]
hostname = api.apubis.com, api.pjq6he.com, api.zbdk8ws.com, api.f38khx.com, api.deyhhc3.com, api.68f4deb.com, api.3459381.com, api.61c76a0.com, api.87735d5.com, api.afe9a49.com, api.c6dd5cc.com, api.2b37894.com, api.35a46dd.com, api.43b8477.com, api.5ce3771.com, api.632d809.com, api.b675211.com, api.a9a2bc4.com, api.8eb269a.com, api.4c86d03.com, api.979bb9e.com, api.988068b.com, api.9cbd862.com, api.c2e777b.com, api.b676039.com, api.ab1e7ee.com, api.5ed249d.com, api.2b1daea.com, api.4934430.com, api.645fb8d.com, api.53cuk7g.com, api.5ebd5d.com, api.em1oifd0.com, api*-uat.*.com, jmtp.*.com, api.k55n2r.com, api.zbdk8ws.com, api.26bb4xt.com, api.vf5x3hv.com, api.fexsqz.com, api.ec53y2t.com, api.j7y675.com, api.pjq6he.com, qqcapi.*.com, www.nj5byj6j.com, api.f38khx.com, api.3459381.com, api.61c76a0.com, api.87735d5.com, api.afe9a49.com, api.c6dd5cc.com, api.2b37894.com, api.35a46dd.com, api.43b8477.com, api.5ce3771.com, api.632d809.com, api.b675211.com, api.a9a2bc4.com, api.8eb269a.com, api.4c86d03.com, api.979bb9e.com, api.988068b.com, api.9cbd862.com, api.c2e777b.com, api.b676039.com, api.ab1e7ee.com, api.5ed249d.com, api.2b1daea.com, api.4934430.com, api.645fb8d.com, api.53cuk7g.com, api.5ebd5d.com, api.em1oifd0.com, api*-uat.*.com, jmtp.*.com, api.k55n2r.com, api.zbdk8ws.com, api.26bb4xt.com, api.vf5x3hv.com

*/
//2025.10.17.08.09
//2025.11.18
//2025.12.22
//2025.12.23
//2025.12.23 21.07
//2026.01.25.20.41

// 环境适配核心类：统一各客户端API，支持Surge/Quantumult X/Loon/Node.js/Stash/Shadowrocket
class EnvAdapter {
    constructor(name, options = {}) {
        this.name = name;
        this.http = new HttpClient(this);
        this.data = null;
        this.dataFile = "box.dat";
        this.logs = [];
        this.isMute = false;
        this.isNeedRewrite = false;
        this.logSeparator = "\n";
        this.encoding = "utf-8";
        this.startTime = Date.now();
        Object.assign(this, options);
        this.log("", `🔔${this.name}, 开始执行!`);
    }

    // 获取当前运行环境
    getEnv() {
        if (typeof $environment !== 'undefined') {
            if ($environment["surge-version"]) return "Surge";
            if ($environment["stash-version"]) return "Stash";
        }
        if (typeof module !== 'undefined' && module.exports) return "Node.js";
        if (typeof $task !== 'undefined') return "Quantumult X";
        if (typeof $loon !== 'undefined') return "Loon";
        if (typeof $rocket !== 'undefined') return "Shadowrocket";
        return "Unknown";
    }

    // 环境判断快捷方法
    isNode() { return this.getEnv() === "Node.js"; }
    isQuanX() { return this.getEnv() === "Quantumult X"; }
    isSurge() { return this.getEnv() === "Surge"; }
    isLoon() { return this.getEnv() === "Loon"; }
    isStash() { return this.getEnv() === "Stash"; }
    isShadowrocket() { return this.getEnv() === "Shadowrocket"; }

    // 数据序列化/反序列化（容错处理）
    toObj(str, defaultValue = null) {
        try { return JSON.parse(str); } catch { return defaultValue; }
    }
    toStr(obj, defaultValue = null) {
        try { return JSON.stringify(obj); } catch { return defaultValue; }
    }

    // JSON数据持久化（读取）
    getjson(key, defaultValue = null) {
        const val = this.getdata(key);
        return val ? this.toObj(val, defaultValue) : defaultValue;
    }

    // JSON数据持久化（写入）
    setjson(obj, key) {
        try { return this.setdata(this.toStr(obj), key); } catch { return false; }
    }

    // 数据持久化核心方法（支持嵌套路径：@namespace.key）
    getdata(key) {
        let val = this.getval(key);
        if (/^@/.test(key)) {
            const match = /^@(.*?)\.(.*?)$/.exec(key);
            if (!match) return val;
            const [, ns, prop] = match;
            const nsVal = this.getval(ns);
            if (nsVal) {
                try {
                    const nsObj = this.toObj(nsVal, {});
                    val = this.lodash_get(nsObj, prop, val);
                } catch {
                    val = "";
                }
            }
        }
        return val;
    }

    // 数据写入（支持嵌套路径）
    setdata(val, key) {
        if (/^@/.test(key)) {
            const match = /^@(.*?)\.(.*?)$/.exec(key);
            if (!match) return this.setval(val, key);
            const [, ns, prop] = match;
            const nsVal = this.getval(ns) || "{}";
            const nsObj = this.toObj(nsVal, {});
            this.lodash_set(nsObj, prop, val);
            return this.setval(this.toStr(nsObj), ns);
        }
        return this.setval(val, key);
    }

    // 底层数据读取（适配各环境）
    getval(key) {
        switch (this.getEnv()) {
            case "Surge": case "Loon": case "Stash": case "Shadowrocket":
                return $persistentStore.read(key);
            case "Quantumult X":
                return $prefs.valueForKey(key);
            case "Node.js":
                this.data = this.loaddata();
                return this.data[key];
            default:
                return this.data?.[key] || null;
        }
    }

    // 底层数据写入（适配各环境）
    setval(val, key) {
        switch (this.getEnv()) {
            case "Surge": case "Loon": case "Stash": case "Shadowrocket":
                return $persistentStore.write(val, key);
            case "Quantumult X":
                return $prefs.setValueForKey(val, key);
            case "Node.js":
                this.data = this.loaddata();
                this.data[key] = val;
                this.writedata();
                return true;
            default:
                return false;
        }
    }

    // Node.js本地文件加载数据
    loaddata() {
        if (!this.isNode()) return {};
        const fs = require("fs");
        const path = require("path");
        const localPath = path.resolve(this.dataFile);
        const cwdPath = path.resolve(process.cwd(), this.dataFile);
        if (!fs.existsSync(localPath) && !fs.existsSync(cwdPath)) return {};
        const targetPath = fs.existsSync(localPath) ? localPath : cwdPath;
        try {
            return JSON.parse(fs.readFileSync(targetPath, this.encoding));
        } catch {
            return {};
        }
    }

    // Node.js本地文件写入数据
    writedata() {
        if (this.isNode()) {
            const fs = require("fs");
            const path = require("path");
            const localPath = path.resolve(this.dataFile);
            const cwdPath = path.resolve(process.cwd(), this.dataFile);
            const targetPath = fs.existsSync(localPath) ? localPath : cwdPath;
            fs.writeFileSync(targetPath, this.toStr(this.data), this.encoding);
        }
    }

    // 模拟lodash.get：安全获取对象嵌套属性
    lodash_get(obj, path, defaultValue = null) {
        const paths = path.replace(/\[(\d+)\]/g, ".$1").split(".");
        let result = obj;
        for (const p of paths) {
            result = Object(result)[p];
            if (result === undefined) return defaultValue;
        }
        return result;
    }

    // 模拟lodash.set：安全设置对象嵌套属性
    lodash_set(obj, path, value) {
        if (Object(obj) !== obj) return obj;
        const paths = Array.isArray(path) ? path : path.replace(/\[(\d+)\]/g, ".$1").split(".");
        const lastKey = paths.pop();
        const target = paths.reduce((acc, p, idx) => {
            if (Object(acc[p]) !== acc[p]) {
                acc[p] = /^\d+$/.test(paths[idx+1]) ? [] : {};
            }
            return acc[p];
        }, obj);
        target[lastKey] = value;
        return obj;
    }

    // 网络请求：GET（统一各环境API）
    get(options, callback = () => {}) {
        // 清理多余请求头
        if (options.headers) {
            delete options.headers["Content-Type"];
            delete options.headers["Content-Length"];
            delete options.headers["content-type"];
            delete options.headers["content-length"];
        }
        // 拼接URL参数
        if (options.params) {
            options.url += "?" + this.queryStr(options.params);
        }
        // Surge跳过脚本拦截标识
        if (this.isSurge() && this.isNeedRewrite) {
            options.headers = options.headers || {};
            options.headers["X-Surge-Skip-Scripting"] = false;
        }
        // 各环境适配
        switch (this.getEnv()) {
            case "Surge": case "Loon": case "Stash": case "Shadowrocket":
                $httpClient.get(options, (err, res, body) => {
                    if (!err && res) {
                        res.body = body;
                        res.statusCode = res.status || res.statusCode;
                        res.status = res.statusCode;
                    }
                    callback(err, res, body);
                });
                break;
            case "Quantumult X":
                options.opts = options.opts || {};
                options.opts.hints = false;
                $task.fetch(options).then(res => {
                    callback(null, {
                        status: res.statusCode,
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: res.body
                    }, res.body);
                }, err => callback(err || "Unknown Error"));
                break;
            case "Node.js":
                const got = require("got");
                const iconv = require("iconv-lite");
                got(options).then(res => {
                    const body = iconv.decode(res.rawBody, this.encoding);
                    callback(null, {
                        status: res.statusCode,
                        statusCode: res.statusCode,
                        headers: res.headers,
                        rawBody: res.rawBody,
                        body: body
                    }, body);
                }, err => {
                    callback(err.message, err.response, err.response ? iconv.decode(err.response.rawBody, this.encoding) : null);
                });
                break;
        }
    }

    // 网络请求：POST（统一各环境API）
    post(options, callback = () => {}) {
        const method = options.method?.toLowerCase() || "post";
        // 自动设置Content-Type
        if (options.body && options.headers && !options.headers["Content-Type"] && !options.headers["content-type"]) {
            options.headers["content-type"] = "application/x-www-form-urlencoded";
        }
        // 清理多余请求头
        if (options.headers) {
            delete options.headers["Content-Length"];
            delete options.headers["content-length"];
        }
        // Surge跳过脚本拦截标识
        if (this.isSurge() && this.isNeedRewrite) {
            options.headers = options.headers || {};
            options.headers["X-Surge-Skip-Scripting"] = false;
        }
        // 各环境适配
        switch (this.getEnv()) {
            case "Surge": case "Loon": case "Stash": case "Shadowrocket":
                $httpClient[method](options, (err, res, body) => {
                    if (!err && res) {
                        res.body = body;
                        res.statusCode = res.status || res.statusCode;
                        res.status = res.statusCode;
                    }
                    callback(err, res, body);
                });
                break;
            case "Quantumult X":
                options.method = method;
                options.opts = options.opts || {};
                options.opts.hints = false;
                $task.fetch(options).then(res => {
                    callback(null, {
                        status: res.statusCode,
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: res.body
                    }, res.body);
                }, err => callback(err || "Unknown Error"));
                break;
            case "Node.js":
                const got = require("got");
                const iconv = require("iconv-lite");
                const { url, ...rest } = options;
                got[method](url, rest).then(res => {
                    const body = iconv.decode(res.rawBody, this.encoding);
                    callback(null, {
                        status: res.statusCode,
                        statusCode: res.statusCode,
                        headers: res.headers,
                        rawBody: res.rawBody,
                        body: body
                    }, body);
                }, err => {
                    callback(err.message, err.response, err.response ? iconv.decode(err.response.rawBody, this.encoding) : null);
                });
                break;
        }
    }

    // 格式化时间
    formatTime(format, timestamp = null) {
        const date = timestamp ? new Date(timestamp) : new Date();
        const fmtObj = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "H+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3),
            S: date.getMilliseconds()
        };
        // 处理年份
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        // 处理其他时间单位
        for (const key in fmtObj) {
            if (new RegExp(`(${key})`).test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? fmtObj[key] : (`00${fmtObj[key]}`).substr((fmtObj[key] + "").length));
            }
        }
        return format;
    }

    // 对象转URL查询字符串
    queryStr(obj) {
        let str = "";
        for (const key in obj) {
            let val = obj[key];
            if (val === null || val === "") continue;
            if (typeof val === "object") val = this.toStr(val);
            str += `${encodeURIComponent(key)}=${encodeURIComponent(val)}&`;
        }
        return str.slice(0, -1);
    }

    // 系统通知（适配各环境）
    notify(title = this.name, subtitle = "", content = "", options = {}) {
        if (this.isMute) return;
        // 处理通知跳转参数
        const getNotifyOpt = (opt) => {
            if (typeof opt === "undefined") return;
            if (typeof opt === "string") {
                return this.isLoon() || this.isShadowrocket() ? opt : { url: opt };
            }
            if (typeof opt === "object") {
                const openUrl = opt.url || opt.openUrl || opt["open-url"];
                const mediaUrl = opt.mediaUrl || opt["media-url"];
                const pasteboard = opt.updatePasteboard || opt["update-pasteboard"];
                if (this.isQuanX()) {
                    return { "open-url": openUrl, "media-url": mediaUrl, "update-pasteboard": pasteboard };
                }
                if (this.isLoon()) {
                    return { openUrl, mediaUrl };
                }
                return { url: openUrl };
            }
        };
        // 各环境通知API
        switch (this.getEnv()) {
            case "Surge": case "Loon": case "Stash": case "Shadowrocket":
                $notification.post(title, subtitle, content, getNotifyOpt(options));
                break;
            case "Quantumult X":
                $notify(title, subtitle, content, getNotifyOpt(options));
                break;
            case "Node.js":
                // Node.js无通知，仅打印
                break;
        }
        // 日志记录通知内容
        const logContent = ["", "==============📣系统通知📣==============", title];
        if (subtitle) logContent.push(subtitle);
        if (content) logContent.push(content);
        this.log(...logContent);
    }

    // 日志打印
    log(...args) {
        if (args.length === 0) return;
        const logStr = args.join(this.logSeparator);
        this.logs.push(logStr);
        console.log(logStr);
    }

    // 错误日志（带堆栈）
    logError(err) {
        const errMsg = this.isNode() ? err.stack : err;
        this.log("", `❗️${this.name}, 执行错误:`, errMsg);
    }

    // 延时等待
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 脚本结束（适配各环境）
    done(result = {}) {
        const duration = (Date.now() - this.startTime) / 1000;
        this.log("", `🔔${this.name}, 执行结束! 🕛 耗时 ${duration.toFixed(2)} 秒`);
        switch (this.getEnv()) {
            case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X":
                $done(result);
                break;
            case "Node.js":
                process.exit(0);
                break;
        }
    }
}

// 网络请求客户端：封装GET/POST为Promise
class HttpClient {
    constructor(env) {
        this.env = env;
    }

    get(options) {
        return new Promise((resolve, reject) => {
            this.env.get(options, (err, res, body) => {
                err ? reject(err) : resolve({ res, body });
            });
        });
    }

    post(options) {
        return new Promise((resolve, reject) => {
            this.env.post(options, (err, res, body) => {
                err ? reject(err) : resolve({ res, body });
            });
        });
    }

    send(options, method = "GET") {
        return method.toUpperCase() === "POST" ? this.post(options) : this.get(options);
    }
}

// 暴露全局Env方法，保持原脚本调用方式
function Env(name, options) {
    return new EnvAdapter(name, options);
}

// ===================== 核心业务逻辑：网络拦截+数据解密 =====================
(function() {
    // 初始化环境
    const env = new EnvAdapter("数据解密脚本", { isNeedRewrite: true });
    // 加密配置（原混淆代码中动态生成的密钥/向量/算法配置）
    const cryptoConfig = {
        key: env.getdata("@crypto.key") || "",
        iv: env.getdata("@crypto.iv") || "",
        mode: "AES-CBC",
        padding: "Pkcs7"
    };

    // 解密方法：AES解密（适配原脚本的解密逻辑）
    function decryptData(encryptedData, key, iv, config) {
        try {
            // 此处需根据实际加密方式实现，原脚本为AES-CBC/Pkcs7Padding
            // 可结合crypto-js/各客户端内置加密API实现，示例框架如下：
            const decodedData = atob(encryptedData);
            // const decrypted = CryptoJS.AES.decrypt(decodedData, CryptoJS.enc.Base64.parse(key), {
            //     iv: CryptoJS.enc.Base64.parse(iv),
            //     mode: CryptoJS.mode.CBC,
            //     padding: CryptoJS.pad.Pkcs7
            // });
            // return decrypted.toString(CryptoJS.enc.Utf8);
            return decodedData; // 占位，需根据实际加密规则实现
        } catch (err) {
            env.logError(`解密失败: ${err.message}`);
            return encryptedData;
        }
    }

    // 加密方法：AES加密（适配原脚本的加密逻辑）
    function encryptData(plainData, key, iv, config) {
        try {
            // 此处需根据实际加密方式实现，与解密对称
            // const encrypted = CryptoJS.AES.encrypt(plainData, CryptoJS.enc.Base64.parse(key), {
            //     iv: CryptoJS.enc.Base64.parse(iv),
            //     mode: CryptoJS.mode.CBC,
            //     padding: CryptoJS.pad.Pkcs7
            // });
            // return btoa(encrypted.toString());
            return btoa(plainData); // 占位，需根据实际加密规则实现
        } catch (err) {
            env.logError(`加密失败: ${err.message}`);
            return plainData;
        }
    }

    // 处理响应数据：解密+清洗+重写
    function handleResponse(response) {
        try {
            // 1. 获取加密响应体
            const encryptedBody = response.body || "";
            if (!encryptedBody) return response;
            // 2. AES解密
            const decryptedBody = decryptData(encryptedBody, cryptoConfig.key, cryptoConfig.iv, cryptoConfig);
            const bodyObj = env.toObj(decryptedBody, {});
            // 3. 数据清洗：移除广告/无用字段（原脚本核心逻辑）
            cleanInvalidData(bodyObj);
            // 4. 重新加密（如需）并返回
            const newBody = encryptData(env.toStr(bodyObj), cryptoConfig.key, cryptoConfig.iv, cryptoConfig);
            return { ...response, body: newBody };
        } catch (err) {
            env.logError(`响应处理失败: ${err.message}`);
            return response;
        }
    }

    // 数据清洗：移除广告、空字段、无用配置（原脚本核心清洗逻辑）
    function cleanInvalidData(data) {
        if (typeof data !== "object" || data === null) return;
        // 递归清洗对象/数组
        const clean = (obj) => {
            for (const key in obj) {
                // 移除广告相关字段（可根据实际业务扩展）
                if (/ad|AD|advert|Advert|banner|Banner/.test(key)) {
                    delete obj[key];
                    continue;
                }
                // 移除空值/空数组/空对象
                if (obj[key] === null || obj[key] === "" || obj[key] === undefined) {
                    delete obj[key];
                    continue;
                }
                if (Array.isArray(obj[key]) && obj[key].length === 0) {
                    delete obj[key];
                    continue;
                }
                if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
                    clean(obj[key]);
                    // 清洗后空对象直接移除
                    if (Object.keys(obj[key]).length === 0) delete obj[key];
                }
            }
        };
        clean(data);
    }

    // 核心拦截逻辑：匹配/article/detail等接口，处理请求/响应
    const requestUrl = $request.url || "";
    if (/\/article\/detail|\/v2\.5\/navigation|\/bootstrap/.test(requestUrl)) {
        // 拦截响应并处理
        const originalResponse = $response;
        const handledResponse = handleResponse(originalResponse);
        env.done({ body: handledResponse.body });
    } else {
        // 非目标接口，直接放行
        env.done($response);
    }
})();
