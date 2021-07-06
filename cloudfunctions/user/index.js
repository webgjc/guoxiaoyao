// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

Date.prototype.format = function(fmt) { 
  var o = { 
     "M+" : this.getMonth()+1,                 //月份 
     "d+" : this.getDate(),                    //日 
     "h+" : this.getHours(),                   //小时 
     "m+" : this.getMinutes(),                 //分 
     "s+" : this.getSeconds(),                 //秒 
     "q+" : Math.floor((this.getMonth()+3)/3), //季度 
     "S"  : this.getMilliseconds()             //毫秒 
 }; 
 if(/(y+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
 }
  for(var k in o) {
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
  }
 return fmt; 
}

async function getUserInfo(e, user, wxContext) {
  let myinfo = await user.where({
    _openid: wxContext.OPENID
  }).get();
  if(myinfo.data.length == 0) {
    return undefined;
  } else {
    return myinfo.data[0];
  }
}

async function checkInfoLogin(e, user, wxContext) {
  let myinfo = await getUserInfo(e);
  let loginStatus = false;
  if(!myinfo) {
    await user.add({
      data: {
        _openid: wxContext.OPENID,
        updateTime: new Date().format("yyyy-MM-dd hh:mm:ss"),
        createTime: new Date().format("yyyy-MM-dd hh:mm:ss")
      }
    })
  }else{
    if(myinfo.nickName && myinfo.phone) {
      loginStatus = true;
    }
  }
  return loginStatus;
}

async function updateUserInfo(e, user, wxContext) {
  e.updateTime = new Date().format("yyyy-MM-dd hh:mm:ss")
  return await user.where({
    _openid: wxContext.OPENID
  }).update({
    data: e,
    success: function(e) {
      return true;
    }
  })
}


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const userDb = db.collection('user')
  const func = event.func;
  delete event.func;
  delete event.userInfo;

  if(func === "getUserInfo") {
    return getUserInfo(event, userDb, wxContext)
  }else if(func === "checkInfoLogin") {
    return checkInfoLogin(event, userDb, wxContext)
  }else if(func === "updateUserInfo") {
    return updateUserInfo(event, userDb, wxContext)
  }

}
