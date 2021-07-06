Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    login: function() {
      let that = this
      wx.cloud.callFunction({
        name: "user",
        data: {
          func: "getUserInfo"
        },
        success: function(res) {
          let phone = res.result.phone
          if(phone) {
            res.result.dealPhone = phone.slice(0, 3) + "****" + phone.slice(7);
          }
          that.setData({
            userInfo: res.result
          })
          wx.setStorage({
            key: "user",
            data: {
              userInfo: res.result,
              time: +new Date()
            }
          })
        }
      })
    }
  },

  dealPhoneNumber: function(phone) {
    return ;
  },

  lifetimes: {
    attached: function() {
      let that = this
      wx.getStorage({
        key: "user",
        success: function(res) {
          if(res && res.data && res.data.userInfo && +new Date() - res.data.time < 1000 * 3600 * 24) {
            that.setData({
              userInfo: res.data.userInfo
            })
            return
          }
          that.login()
        },
        fail: function(res) {
          that.login()
        }
      })
      
    }
  }
})
