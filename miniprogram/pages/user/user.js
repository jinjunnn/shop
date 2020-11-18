const {
  User
} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

Page({
  data: {
    display:true,
    icon_box: image.box,
    icon_team: image.team,
    icon_arrow: image.arror_icon,
    icon_lottery: image.lottery,
    icon_order: image.icon_order,
    icon_fuwu: image.fuwu,
    icon_lipinka: image.lipinka,
    icon_hezuo: image.hezuo,
    icon_yongjin: image.yongjin,
    icon_qrcode:image.qrcode_icon,
    icon_invite:image.invite_icon,
    icon_service: image.custom_icon,
    showModalStatus:0,
    code:null,
  },
  /**
   * 缴纳保证金
   */
  bind_deposit(){

  },

  /**
   * 实名认证
   */
  bind_verify(){
    let that = this;
    that.showModal(2);
  },

  /**
   * 
   */
  bind_customer_service(){
    let that = this;
    that.showModal(6);
  },

  bind_tap(e) {
      common.showToast(e.currentTarget.dataset.information);
  },
  /**
   * 邀请码设置
   */
  bind_invite(){
    let that = this;
    if (app.globalData.userInfo.inviter_code) {
      common.showToast('您的邀请码为'+app.globalData.userInfo.inviter_code+',不可更改');
    }else{
      that.showModal(3);
    }
  },

  bind_input_inviter_code(e){
      console.log(e.detail.value);
      let that = this;
      that.setData({
        inviter_code: e.detail.value
      });
  },

  bind_submit_inviter_code(){
      let that = this;
      let set_user_status = () => {
              const paramsJson = {
                key:'invitation_code',
                field: that.data.inviter_code,
                value: app.globalData.userInfo.uid,
              };
              AV.Cloud.run('setField', paramsJson).then((result) => {

              }).catch(console.error);
      };

      const paramsJson = {
        key: 'invitation_code',
        field: that.data.inviter_code,
      };
      AV.Cloud.run('hasField', paramsJson).then((result) => {
        console.log(result);
        if(result!=1){
          set_user_status();
          common.set_user_field('inviter_code',that.data.inviter_code);
          common.login();
          common.showToast('完成设置');
          that.bind_close();
        }else{
          common.showToast('邀请码已经被占用，请更换');
        }
      }).catch(console.error);
  },

  /**
   * 权限设置
   */
  bind_settings(){
    wx.openSetting({
      success(res) {
      }
    })
  },

  bind_close() {
    let that = this;
    that.hideModal();
  },


  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '我的'
    });
  },

  bind_nav(e) {
    common.navigateTo(e.currentTarget.dataset.url);
  },

  bind_set_userinfo(){
    let that = this;
    if(app.globalData.settings.status == 0||app.globalData.settings.status == 1 || app.globalData.settings.status == 2){
      that.showModal(1);
    }else {
      common.showToast('修改联系方式请联系客服。')
    }
  },

  bind_input_wechatid(e){
    console.log(e.detail.value);
    let that = this;
    that.setData({
      wechatid: e.detail.value
    });
  },

  bind_input_phoneNumber(e){
    console.log(e.detail.value);
    let that = this;
    that.setData({
      phoneNumber: e.detail.value
    });
  },

  bind_submit_userinfo(){
    let that = this;
    if (that.data.wechatid==null) {
        common.showToast('请输入微信号');
    } else if (that.data.phoneNumber == null) {
      common.showToast('请输入手机号码');
    } else {
      common.set_user_field('phoneNumber',that.data.phoneNumber);
      common.set_user_field('wechatid',that.data.wechatid);
      common.showToast('完成设置');
      that.bind_close();
    }
  },
  //出现和隐藏弹出框
  showModal: function (status) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(500).step();
    console.log(animation.export());
    this.setData({
      animationData: animation.export(),
      showModalStatus: status,
      backgroundColor: "bg_color",
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200);
  },

  // 隐藏遮罩层
  hideModal: function () {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(500).step();
    this.setData({
      animationData: animation.export(),
      ackgroundColor: "",
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export(),
        showModalStatus: 0,
        backgroundColor: "",
      });
    }.bind(this), 200);
  },

  bind_input_invitation_code(e){
    console.log(e.detail.value);
    let that = this;
    that.setData({
      code: e.detail.value
    });
  },

  bind_submit_invitation_code(e){
      console.log(e);
      wx.showLoading({
        title: '加载中',
      });
      let set_invitation_code = (code,openid) => {
            const paramsJson = {
              code: code,
              user: 'user_' + openid,
            };
            console.log(paramsJson);
            return AV.Cloud.run('invitation_code', paramsJson).then((x) => {
              console.log(x);
              //  用户输入的邀请码不正确
              if (x != 1) {
                common.showToast('您输入的邀请码不正确');
                wx.hideLoading();
              }
              //用户输入的邀请码正确
              else {
                const paramsJson = {
                  userinfo: e.detail.userInfo,
                  objectid: openid,
                };
                return AV.Cloud.run('get_user_info', paramsJson).then((x) => {
                  that.setData({
                    userInfo: x,
                  });
                  console.log(x)
                  wx.hideLoading();
                  that.hideModal();
                  common.showToast('登录成功');
                  app.globalData.userInfo = x;
                }).catch(console.error);
              }
            })
      }
      let that = this;
      let login = (openid) => {
        if (!e.detail.hasOwnProperty('userInfo')) {
          wx.hideLoading();
        } else {
          //  用户没有输入邀请码
          if (that.data.invitation_code) {
            //如果存在邀请码
              set_invitation_code(that.data.invitation_code, openid);
          } else if (that.data.code) {
              set_invitation_code(that.data.code, openid);
          }
          //  用户输入了邀请码
          else {
              common.showToast('请填写您的邀请码');
          }
        }
      };
      
      if (Boolean(app.globalData.userInfo)) {
        login(app.globalData.userInfo.objectid);
      } else {
        app.userInfoReadyCallback = u => {
          login(u);
        }
      }
  },

  /**
   * 金币
   */
  bind_balance(e){
    common.showModal('金币满20元可以取现','金币');
  },
  /**
   * 点击银币
   */
  bind_intergal(e){
    common.showModal('邀请一个代购可以获得2银币，银币可以在购买礼品卡每次最高抵用8元。','银币');
  },
  /**
   * 点击积分
   */
  bind_deposit(e){
    common.showModal('发布求购信息可以获得积分，部分服务需要一定的积分等级。','积分');
  },

  onShow: function () {
    let that = this;
    let query_user = (verify) => {
        if (Boolean(app.globalData.userInfo)) {
            that.setData({
              user: app.globalData.userInfo,
              wechatid:app.globalData.userInfo.wechatid,
              phoneNumber:app.globalData.userInfo.phoneNumber,
            });
            if(verify==1){
              common.query_user_status(app.globalData.userInfo.status);
            }
        } else {
          app.userInfoReadyCallback = u => {
            that.setData({
              user: u,     
              wechatid:app.globalData.userInfo.wechatid,
              phoneNumber:app.globalData.userInfo.phoneNumber,
            });
            if(verify==1){
              common.query_user_status(u.status);
            }
          };
        }
    }
    if (Boolean(app.globalData.settings)) {
        query_user(app.globalData.settings.verify);
        that.setData({settings: app.globalData.settings,});
    } else {
      app.settingsCallback = s => {
        query_user(s.verify);
        that.setData({settings: s});
      }
    }
  }
});

