import axios from "axios";
import qs from "qs";
import { Dialog, Toast } from "vant";
const CancelToken = axios.CancelToken;
var cancelList = [];
export var opt = {
    load: true,         //true代表会显示加载状态，false表示关闭加载状态
    loadingText: '',    //加载时提示文本内容
    codeKey: 'status',  //请求的返回状态码的键(默认是result.data.status != 0, 其中值为 0 时表示请求正确、正常返回)
    codeValid: 0,       //请求的返回状态码的值(默认是0，非0则表示请求错误)
};
var _opt = {
    OnlyOnce: false,
    headers: ''
}
axios.defaults.baseURL = process.env.VUE_APP_BASE_API;
//设置超时
axios.defaults.timeout = 10000;

axios.interceptors.request.use(
    config => {
        if(opt.load){
            Toast.loading({
                duration: 0,
                message: opt.loadingText || '加载中...',
                forbidClick: true,
            });
        }
        return config;
    },
    error => {
        //401：超时，404：not found 没找到接口
        Dialog.alert({
            title: "错误提示",
            message: "请求错误，请联系管理员进行处理！(错误内容：" + error + ")"
        });
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    response => {
        opt.load && Toast.clear();
        return response;
    },
    error => {
        //500：系统错误，502：系统重启
        opt.load && Toast.clear();
        if (error.message == "interrupt") {
            console.log('已中断请求');
            return;
        } else {
            Dialog.alert({
                title: "温馨提示",
                message: error.msg || "咦？网络好像跑丢了..."
            });
        }
    }
);

console.log('request defaults:', axios.defaults);

/**
 * @param {String} newHeader           新添加的响应头内容
 * @param {Boolean/Number} status      新请求头的可用次数(false: 永久可用, true: 可用一次, {Number}: 可用{Number}次)
 * 需要是post请求
 **/
export function setHeader(newHeader, status = false){
    if(typeof newHeader != 'string'){
        console.error('Response header setting:', 'not an string');
        return false;
    }
    if(!status) axios.defaults.headers.post["Content-Type"] = newHeader;
    else{
        _opt.OnlyOnce = status;
        _opt.headers = newHeader;
    }
}

export function stopRequest(){
    if(cancelList.length>0){        //强行中断时才向下执行
        cancelList.forEach(item=>{
            item('interrupt');		//给个标志，中断请求
        })
    }
}

export function get(api, params){
    return axiosApi(api, params, 'get');
}

export function post(api, params){
    return axiosApi(api, params, 'post');
}

export function form(api, params){
    return axiosApi(api, params, 'form');
}

export function getUrl(str, obj){
    let url = process.env.VUE_APP_BASE_API,
        uri = str.split('/');
    url += '/index.php?';
    if (uri.length == 1) {
        url = url + 'g=Wxapp&m=Release&a=' + str;
    } else {
        url += 'g=Wxapp&m=' + uri[0] + '&a=' + uri[1];
    }
    if(obj){
        for (var i in obj) {
            url += '&' + i + '=' + obj[i];
        }
    }
    url += '&token=' + process.env.VUE_APP_TOKEN;
    return url;
}

function axiosApi(api, params, method) {
    if (process.env.NODE_ENV === 'production') {
        //可在这进行线上环境的不同定义 
    } else {
        //可在这进行非线上环境的不同定义
    }
    let url = getUrl(api);
    if(_opt.OnlyOnce > 0){
        axios.defaults.headers.post["Content-Type"] = _opt.headers;
        if( typeof _opt.OnlyOnce == 'number') _opt.OnlyOnce--;
        else _opt.OnlyOnce = false;
    }else{
        if(method == 'form'){
            axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
            method = 'post';
        }else{
            axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";
        }
    }
    var data = method == "post" ? qs.stringify(params) : params;
    return new Promise((resolve, reject) => {
        axios({
            method: method,
            url: url,
            data: data,
            cancelToken: new CancelToken(function executor(c) {
                cancelList.push(c);
            })
        })
        .then(res => {
            if (res[opt.code] == 0) {
                resolve(res)
            } else {
                Dialog.alert({
                    title: "温馨提示",
                    message: res.msg || 'ε=(´ο｀*))) 小主~ 网络好像打盹了呢...'
                });
                return false;
            }
        })
        .catch(err => {
            reject(err)
        });
    })
}
export default {
    opt, setHeader, stopRequest, get, post, form, getUrl
}