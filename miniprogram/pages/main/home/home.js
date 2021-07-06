// pages/main/home/home.js
const app = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    swiperList: [],
    recommendList: []
  },

  ready: function() {
    let that = this
    wx.cloud.callFunction({
      name: "sku",
      data: {
        func: "getSkuList",
        where: {
          swiper: true
        }
      },
       success: function(res) {
         that.setData({
           swiperList: res.result.data
         })
       }
    })

    wx.cloud.callFunction({
      name: "sku",
      data: {
        func: "getSkuList",
        where: {
          recommend: true
        }
      },
      success: function(res) {
        that.setData({
          recommendList: res.result.data
        })
      }
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toDetail: function(e) {
      wx.navigateTo({
        url: '/pages/main/detail/detail?sku=' + e.currentTarget.dataset.sku,
      })
    },
    searchSku: function(e) {
      if(e.detail.value) {
        wx.navigateTo({
          url: '/pages/main/sku/sku?search=' + e.detail.value,
        })
      }
    }
  }
    
})
