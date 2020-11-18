const {User} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();

Page({
  data: {
    invitation_code:null,
    wechatid:null,
    phone:null,
  },
  onLoad: function () {
    let that = this;
    if (Boolean(app.globalData.userInfo)) {
      that.setData({user: app.globalData.userInfo});
    } else {
      app.userInfoReadyCallback = u => that.setData({user: u});
    }
  },
  /**
   * 获取用户信息，并存储到redis中。
   * @param {} e 
   */
  bind_donot_login() {
    wx.navigateTo({
      url: '/pages/user/login/donot_login',
    });
  },

  input_amount(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      invitation_code: e.detail.value
    });
  },

  input_wechatid(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      wechatid: e.detail.value
    });
  },

  input_phone(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      phone: e.detail.value
    });
  },

  post(){
    let that = this;
    if (that.data.wechatid==null) {
        common.showToast('请输入微信号');
    } else if (that.data.phone == null) {
      common.showToast('请输入手机号码');
    } else {
      common.set_user_field('phoneNumber',that.data.phone);
      common.set_user_field('wechatid',that.data.wechatid);
      common.set_user_field('status',3);
      common.showToast('完成设置');
      common.login();
      app.globalData.userInfo.status = 3;
      wx.navigateBack({delta: 1});
    }
  },

  login(e) {
    console.log(e);
    wx.showLoading({title: '加载中',});
    let that = this;
    let login = (uid,code) => {
      if (!e.detail.hasOwnProperty('userInfo')) {
        common.showToast('本小程序仅对授权用户开放');
      } else {
          //  用户没有输入邀请码
          if (!that.data.invitation_code) {
            common.showToast('请填写您的邀请码');
          } 
          //  用户输入了邀请码
          else {
            const paramsJson = {
              invitation_code: that.data.invitation_code,
              uid: uid,
              code:code,
            };
            console.log(paramsJson);
            AV.Cloud.run('invitation_code', paramsJson).then((x) => {
              console.log(x);
              wx.hideLoading();
              if (x.code == -1) {
                common.showToast('您输入的邀请码不正确');
              } 
              else {
                common.showToast('注册成功');
                common.login();
                app.globalData.userInfo.status = 2;
                wx.navigateBack({delta: 1});
              }
            })
          }

      }

    };
    login(app.globalData.userInfo.uid,app.globalData.userInfo.code);
  },
});