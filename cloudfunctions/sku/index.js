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

async function getSkuList(event, db) {
  let sql = db.collection("sku")
  if(event.where) {
    event.where.enable = true
    sql = sql.where(event.where)
  } else {
    sql = sql.where({enable: true})
  }
  if(event.orderBy) sql = sql.sort(event.orderBy.field, event.orderBy.order)
  if(event.skip) sql = sql.skip(event.skip)
  if(event.limit) sql = sql.skip(event.limit)
  return await sql.get()
}

async function getSku(event, db) {
  return await db.collection("sku")
  .doc(event.skuId)
  .get()
}

async function searchSku(event, db) {
  let _ = db.command
  return await db.collection("sku")
  .where(_.and([
    {
      enable: true,
    },
    _.or([
      {
        name: db.RegExp({
          regexp: `.*${event.search}.*`,
          options: 'i'
        })
      },
      {
        remark: db.RegExp({
          regexp: `.*${event.search}.*`,
          options: 'i'
        })
      }
    ]),
  ])).get()
}

async function addSku(event, db) {
  event.skuInfo.createTime = new Date().format("yyyy-MM-dd hh:mm:ss")
  event.skuInfo.updateTime = new Date().format("yyyy-MM-dd hh:mm:ss")
  event.skuInfo.enable = true
  return await db.collection("sku").add({
    data: event.skuInfo
  })
}

async function updateSku(event, db) {
  event.skuInfo.updateTime = new Date().format("yyyy-MM-dd hh:mm:ss")
  let skuId = event.skuInfo._id
  delete event.skuInfo._id
  return await db.collection("sku").doc(skuId).update({
    data: event.skuInfo
  })
}

async function getSkuAll(event, db) {
  let skuInfo = await db.collection("sku").doc(event.skuId).get()
  let detail = await db.collection("sku_detail").where({
    skuId: event.skuId
  }).get()
  if(detail.data.length == 1) {
    skuInfo["data"]["detail"] = detail.data[0]
  }
  return skuInfo["data"]
}

async function upinsertSkuDetail(event, db) {
  let detail = await db.collection("sku_detail").where({
    skuId: event.skuId
  }).get()
  if(detail.data.length == 1) {
    let upres = await db.collection("sku_detail").doc(detail.data[0]._id).update({
      data: event
    })
    return upres.stats.updated == 1
  } else {
    let inres = await db.collection("sku_detail").add({
      data: event
    })
    return inres._id != undefined
  }
}

async function deleteSku(event, db) {
  return await db.collection("sku").doc(event.skuId).update({
    data: {
      enable: false
    }
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const func = event.func;
  delete event.func;
  delete event.userInfo;

  if(func === "getSku") {
    return getSku(event, db)
  }else if(func === "addSku") {
    return addSku(event, db)
  }else if(func === "getSkuList") {
    return getSkuList(event, db)
  }else if(func === "searchSku") {
    return searchSku(event, db)
  }else if(func === "updateSku") {
    return updateSku(event, db)
  }else if(func === "getSkuAll") {
    return getSkuAll(event, db)
  }else if(func === "upinsertSkuDetail") {
    return upinsertSkuDetail(event, db)
  }else if(func === "deleteSku") {
    return deleteSku(event, db)
  }
}