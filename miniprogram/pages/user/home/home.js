// pages/user/home/home.js
Component({
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

  },

  lifetimes: {
    attached: function() {
      if(this.data.userInfo.nickName != undefined) {
        return;
      }
      console.log("login")
      // let that = this
      // wx.cloud.callFunction({
      //   name: "user",
      //   data: {
      //     func: "getUserInfo"
      //   },
      //   success: function(res) {
      //     that.setData({
      //       userInfo: res.result
      //     })
      //   }
      // })
    }
  }
})
