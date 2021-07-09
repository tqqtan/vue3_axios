import axios from "axios";
import qs from "qs";
import { Dialog, Toast } from "vant";
const CancelToken = axios.CancelToken;
var cancelList = [];
export var opt = {
    load: true,         //true代表会显示加载状态，false表示关闭加载状态
    loadingText: '',    //加载时提示文本内容
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
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    response => {
        opt.load && Toast.clear();
        return response;
    },
    error => {
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

export function get(type, params){
    axiosApi(type, params, 'get')
}

export function post(type, params){
    axiosApi(type, params, 'post')
}

export function form(type, params){
    axiosApi(type, params, 'form')
}

function axiosApi(type, params, method) {
    let token = process.env.VUE_APP_TOKEN;
    if (process.env.NODE_ENV === 'production') {
        //可在这进行线上环境的不同定义
    } else {
        //可在这进行非线上环境的不同定义
    }
    var value = {
        token: token
    }
    if(_opt.OnlyOnce){
        axios.defaults.headers.post["Content-Type"] = _opt.headers;
        if( typeof _opt.OnlyOnce == 'number') _opt.OnlyOnce--;
        else _opt.OnlyOnce = false;
    }
    else{
        if(method == 'form'){
            axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
            method = 'post';
        }else{
            axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8"
        }
    }
    var data = method == "post" ? qs.stringify(Object.assign(value, params)) : Object.assign(value, params)
    return new Promise((resolve, reject) => {
        axios({
            method: method,
            url: type,
            data: data,
            cancelToken: new CancelToken(function executor(c) {
                cancelList.push(c);
            })
        })
        .then(res => {
            if (res.status == 0) {
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
    opt, setHeader, stopRequest, get, post, form
}