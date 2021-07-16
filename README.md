## 基于vuecli3的axios请求封装

### 使用步骤

#### 1. 将request.js文件放入assets文件夹中  
#### 2. 配置相关环境变量  
于项目根目录新建 .env.development (开发环境) .env.production (线上环境) .env.test (测试环境) 三个文件  
并在文件中分别定义不同环境时的请求域名变量‘VUE_APP_BASE_API’及相应的token（或其他，可自定义），例：  
```
VUE_APP_BASE_API = "http://localhost:8080/"
VUE_APP_TOKEN = "abcde"
```
于 package.json 文件中修改scripts如下：  
```
"scripts": {
    "dev": "vue-cli-service serve",
    "test": "vue-cli-service serve --mode test",
    "build": "vue-cli-service build",
    "build:test": "vue-cli-service build --mode test",
    "lint": "vue-cli-service lint"
}
```
#### 3. 在需要请求接口的页面引入request.js  
```
/**
 ** 共有 form, post, get三种请求方式
 ** form模拟表单提交
 **/
import { form, post, get } from "@/assets/js/request.js"
```
通过如下方法发送请求  
请求格式为：
```
[请求方式]('[接口名]', [参数]).then([请求无误回调] => {
    [请求无误处理代码块]
}).catch([请求有误回调] => {
    [请求有误处理代码块]
})
```
具体代码如下：  
```
let param = { page: 1 };
form('index/get_list', param).then(res =>{
    //请求成功时的处理
 	console.log(res);
}).catch(err => {
    //请求失败时的处理
    console.log(err);
})
```
> request.js封装了默认的请求前、请求失败后的处理  
> 也可以通过如下方式配置请求的相关项  
> ```
> import { opt, setHeader, stopRequest, getUrl } from "@/assets/js/request.js" 
> /**
>  ** 通过 opt.load = false，关闭请求时的loading状态显示
>  ** 可在请求完成后通过 opt.load = true，开启请求时的loading状态显示
>  ** 通过 opt.loadingText = "正在上传..." 改变加载状态时显示的提示文本
>  ** 通过 setHeader 改变请求头
>  ** 通过 stopRequest 关闭停止正在请求的所有请求（多用于vant的tab切换）
>  **/
> ```  

> * setHeader的使用   

> ```
> /**
>  ** 当前版本仅可更改post下的请求头
>  ** 第一个参数为修改的请求头内容(String类型)
>  ** 第二个参数为新请求头的可用次数(Number/Boole类型) false: 永久可用, true: 可用一次, {Number}: 可用{Number}次
>  **/
> setHeader("application/x-www-form-urlencoded;charset=UTF-8", 3);
> ```  

> * stopRequest的使用  

> ```
> 无需任何参数，终止当前情况下所有请求中的请求
> stopRequest();
> ```  

> * getUrl的使用  

> ```
> /**
>  ** 用于与域名、接口名拼接生成请求路径
>  ** 第一个参数为请求接口名(String类型)，例如：'index'、'index/index'
>  ** 第二个参数为请求接口路径中还需要额外拼接的对象(Object) 非必须
>  **/
> getUrl('index');  
> 最终请求的域名为 http://localhost:8080/index.php?g=Wxapp&m=Release&a=index&token=abcde  
>  
> getUrl('index', {a: 0, b: 1});
> 最终请求的域名为 http://localhost:8080/index.php?g=Wxapp&m=Release&a=index&token=abcde&a=0&b=1
>  
> getUrl('index/index', {a: 0, b: 1});
> 最终请求的域名为 http://localhost:8080/index.php?g=Wxapp&m=index&a=index&token=abcde&a=0&b=1
>  
> getUrl('wap/index/index', {a: 0, b: 1});
> 最终请求的域名为 http://localhost:8080/index.php?g=wap&m=index&a=index&token=abcde&a=0&b=1
> 以上第一个参数中可用'/'作为请求中g/m/a的设置，更多层可自行于getUrl方式中定义
> ```  
> 请求路径若为'/'拼接则可修改getUrl为如下代码
> ```  
> 例：
> let url = process.env.VUE_APP_BASE_API,
>     uri = str.split('/');
> url += '/index.php/';
> if (uri.length == 1) {
>     url = url + 'g/Wxapp/m/Release/a/' + str;
> } else if(uri.length == 2) {
>     url += 'g/Wxapp/m/' + uri[0] + '/a/' + uri[1];
> } else{
>     url += 'g/' + uri[0] + '/m/' + uri[1] + '/a/' + uri[2];
> }
> if(obj){
>     for (var i in obj) {
>         url += '/' + i + '/' + obj[i];
>     }
> }
> url += '/token/' + process.env.VUE_APP_TOKEN;
> return url;
> 
> getUrl('index', {a: 0, b: 1});
> 最终请求的域名为 http://localhost:8080/index.php/g/Wxap/m/Release/a/index/token/abcde/a/0/b/1
> ```  
### 注意事项
* 本版本封装的request.js中，根据作者项目需求定义了 process.env.VUE_APP_TOKEN，用于定义每个接口都会必须传入的变量，使用时若无相关需求可在request.js中关闭相关配置  
* 若需要使用该变量，可在步骤2中按示例添加;  
* 于 request.js 的 axiosApi 方法中设置了如下不同环境下请求的其他处理，可自行添加
```
if (process.env.NODE_ENV === 'production') {
    //可在这进行线上环境的不同定义
} else {
    //可在这进行非线上环境的不同定义
}
```