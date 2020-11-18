
const AV = require('./utils/av-live-query-weapp-min');
let userinfo;
let sharer;

AV.init({
  appId: '0EaEC5sQIVi9vLFPkeWwLoPN-gzGzoHsz',
  appKey: '9FSCquoqkct3wctAtzhYJ15K',
});

App({
  onLaunch: function (options) {
    // console.log(options);
    let that = this;
    if (options.query.hasOwnProperty('sharer')) {
      sharer = options.query.sharer;
    }
    if (options.query.hasOwnProperty('scene')) {
      sharer = decodeURIComponent(options.query.scene);
    }
    that.login(sharer);
    
  },

  /**
   * 初始化数据
   */
  query_settings() {
    let that = this;
    let s = {};
    let paramsJson = {
      key: 'shop_app_settings',
    };
    AV.Cloud.run('getHash', paramsJson).then(function (settings) {
      s = settings;
      that.globalData.settings = settings;
      
    }).then(() => {
      if (this.settingsCallback) {
        this.settingsCallback(s);
      }
    }).catch(console.error);
  },


  // 获得群id
  get_group_id(uid) {
    let that = this;
    let get_group_id = () => {
      let info = wx.getLaunchOptionsSync();
      if (info.shareTicket) {
        wx.getShareInfo({
          shareTicket: info.shareTicket,
          success: function (res) {
            var encryptedData = res.encryptedData;
            var iv = res.iv;
            var paramsJson = {
              uid: uid,
              encryptedData: encryptedData,
              iv: iv,
              app_name: 'shop'
            }
            AV.Cloud.run('get_group_id', paramsJson).then(data => {
              console.log('groupid=', data);
              that.globalData.groupid = data;
            })
          }
        })
      }
    }
    get_group_id();
  },

  /**
  用户登录：
      console.log(res.code);
      拿到res.code 到后台换openid
      发送 res.code 到后台换取 openId, sessionKey, unionId
      返回值data为0或1，返回值为0，用户没有注册过，返回值为1，用户已经注册过。
  */
  login(sharer) {
    let that = this;
    let u = {};
    wx.login({
      success: res => {
        let paramsJson = {
          code: res.code,
          sharer: sharer,
          app_name:'shop',
        };
        AV.Cloud.run('login', paramsJson).then(function (user) {
          that.query_settings();
          let {phoneNumber=null,wechatid=null,shop=0,invitation_code=null,sharer=null,status=0} = user;
          u = user;
          u.phoneNumber = phoneNumber;
          u.wechatid = wechatid;
          u.shop = shop;
          u.invitation_code = invitation_code;
          u.sharer = sharer;
          u.status = status;
          that.globalData.userInfo = u;
          that.updata_userinfo(u.uid);
          that.get_group_id(u.uid);
        }).then(() => {
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(u);
          }
        }).catch(console.error);
      }
    });
  },

  /**
   * 更新用户信息 
   */

  updata_userinfo: function (uid) {
    let that = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              const paramsJson = {
                userinfo: res.userInfo,
                uid: uid,
              };
              AV.Cloud.run('set_user_info', paramsJson).then(function (data) {}).catch(console.error);
            }
          });
        } else {

        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  globalData: {
    userInfo: null,
    settings: null,
    groupid: null,
  }
})