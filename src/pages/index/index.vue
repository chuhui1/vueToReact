<template>
  <div class="container flexbox" v-bind:class="{'weixin_container': isInWeixin}">
    <div class="header" v-if="!isInWeixin">
      <span class="back" v-bind:click="back">
        <img src="../../../../assets/imgs/booking/Combined Shape@2x.png" alt=""/>
      </span>
      <span class="title">{{pageData}}</span>
      <span class="title">{{orderDetail.title}}</span>
    </div>

    <div class="hotel" v-bind:class="{'weixin_hotel': isInWeixin}">
      <div class="hotel_info">
        <div class="hotel_name">{{orderDetail}}</div>
        <div class="hotel_time" v-for="(item, index) in orderDetail" v-bind:key="index">
          {{item.name}}
          <span >{{item.val}}</span>
        </div>
        <div class="line" v-bind:class="{'hidden_line': isShowHotelDetail}"></div>
      </div>
      <div class="hotel_detail" v-bind:class="{'show_detail': isShowHotelDetail}">
        <div v-for="(item, index) in roomTitle" v-bind:key="index">
          <span>{{item.name}}</span>
          <span class="describe">{{item.val}}</span>
          &nbsp;
        </div>
      </div>
      <div class="hotel_pay">
        <div class="hotel_amount">
          {{pageData.amountTitle}}:
          <span class="span1">{{pageData.foreignCurType}}</span>
          <span class="span2">{{pageData.foreignCur}}</span>
          <span class="span3">(约¥{{pageData.orderAmount}})</span>
        </div>
        <div class="hotel_tips">
          实际支付金额以酒店扣款为准
          <div class="see_detail" v-bind:click="seeDetail">
            <span>{{isShowHotelDetail.data ? '收起详情' : '查看详情'}}</span>
              <img src="../../../../assets/imgs/booking/箭头@2x.png" alt="" class="arrow_bottom"
              v-bind:class="{'arrow_top': isShowHotelDetail}"/>
          </div>
        </div>
      </div>
    </div>
    <div class="special_explain">
      <div v-for="(item, index) in specialExplain" v-bind:key="index">
        <span class="special_explain_icon">
          <img src="../../../../assets/imgs/booking/提示@2x.png" alt=""/>
        </span>
        <span class="special_explain_title">{{item.key}}</span>
      </div>
    </div>
    <div class="pay_method">
      <div class="pay_method_title">请选择以下银行卡进行担保</div>
    </div>
  </div>


</template>

<script>
  import PayMethodList from './payMethodList'
  import CardMsg from '../../components/cardMsg'
  config = {
    navigationBarTitleText: '首页'
  }
  export default {
    data() {
      return {
        key: '',
        pageData: {
          title: '111',
          test1: {
            test5: '222'
          },
          test2: {
            test3: {
              test4: '333'
            }
          }

        },
        orderDetail: [],
        orderDetailTitle: {},
        roomTitle: [],
        backTips: {},
        orderTips: [],
        isShowHotelDetail: false,
        payList: [],
        creditCard: {},
        historyList: [],
        successUrl: '',
        failUrl: '',
        backUrl: '',
        hasHisoryId: false,
        isInWeixin: false,
        specialExplain: [
          {
            key: '信用卡仅用于担保预订，房费由酒店收取。',
          }, {
            key: '酒店会在提交订单数日后或办理入住时扣去房费。'
          }
        ],
      }
    },
    methods: {

    },
    components: {
      PayMethodList, CardMsg
    },
    created() {

    },
  }
</script>
<style>
  .card_msg {
    background-color: #fff;
    border-radius: 16px;
    margin-bottom: 20px;
    font-family: PingFangSC-Regular;
    color: #888;
    font-size: 28px;
  }
  .weixin_card_msg{
    color: #19293F;
  }

  .card_msg .card_bank {
    line-height: 112px;
    border-bottom: 1px solid #e0e0e0;
  }

  .card_msg .card_bank .bank_msg {
    display: flex;
    align-items: center;
    height: 112px;
  }

  .card_msg .card_bank .flex-box {
    display: flex;
    justify-content: space-between;
  }

  .card_msg .card_bank .bank_msg img {
    display: inline-block;
    width: 72px;
    height: 72px;
    align-items: center;
    padding-left: 32px;
    padding-right: 24px;
  }

  .card_msg .card_bank .bank_msg .center {
    flex: 1;
  }

  .card_msg .card_bank .bank_msg .bank_title span {
    display: block;
    line-height: 40px;
    color: #333;
  }
  .card_msg .card_bank .bank_msg .weixin_bank_title span{
    color: #19293F;
  }

  /*.card_msg .card_bank .bank_msg .bank_title span:last-child {*/
  /*color: #888;*/
  /*}*/

  .card_msg .card_bank .btn span {
    color: #4499ff;
    font-size: 24px;
  }
  .card_msg .card_bank .weixin_btn span{
    color: #26BD8F;
  }

  .card_msg .card_bank .btn img {
    width: 24px;
    height: 19px;
    padding-left: 16px;
  }

  .card_msg .card_detail {
    padding: 0 32px;
  }

  .card_msg .card_detail .card_id, .card_msg .card_detail .card_data, .card_msg .card_detail .card_ver, .card_msg .card_detail .card_name {
    border-top: 1px solid #e0e0e0;
    line-height: 75px;
  }

  .card_msg .card_detail div:first-child {
    border-top: 0;
  }

  .card_msg .card_id span, .card_msg .card_data span, .card_msg .card_ver span, .card_msg .card_name span {
    display: inline-block;
    width: 224px;
    /*height: 75px;*/
    line-height: 89px;
    font-size: 28px;
  }

  .card_msg .card_data span img, .card_msg .card_ver span img, .card_msg .card_name span img {
    width: 24px;
    height: 24px;
  }

  .card_msg .card_id input, .card_msg .card_data input, .card_msg .card_ver input, .card_msg .card_name input {
    border: none;
    line-height: 70px;
    font-size: 28px;
    color: #333;
  }
  .weixin_card_msg .card_id input, .weixin_card_msg .card_data input, .weixin_card_msg .card_ver input, .weixin_card_msg .card_name input{
    color: #19293F;
  }

  .card_msg .card_id input::-webkit-input-placeholder, .card_msg .card_data input::-webkit-input-placeholder, .card_msg .card_ver input::-webkit-input-placeholder, .card_msg .card_name input::-webkit-input-placeholder {
    color: #b2b2b2;
    font-size: 28px;
  }
  .weixin_card_msg .card_id input::-webkit-input-placeholder, .weixin_card_msg .card_data input::-webkit-input-placeholder, .weixin_card_msg .card_ver input::-webkit-input-placeholder, .weixin_card_msg .card_name input::-webkit-input-placeholder {
    color: #D2D7E0;
  }

  .card_msg .card_name .card_holder {
    color: #333;
  }

  .card_msg .card_bank .card_title {
    border-bottom: 1px solid #e0e0e0;
    line-height: 88px;
    text-align: center;
    font-size: 32px;
  }
  .card_msg .card_bank .card_title span{
    font-family: PingFangSC-Regular;
    font-size: 32px;
    color: #333333;
    text-align: center;
    line-height: 34px;
  }
  .card_msg .card_bank .card_title img {
    width: 50px;
    height: 50px;
    float: right;
    padding-top: 20px;
    padding-right: 20px;
  }

  .card_msg .card_bank .card_kinds {
    padding-left: 32px;
  }

  .card_msg .card_bank .card_kinds .card_record {
    display: flex;
    height: 112px;
    border-bottom: 1px solid #e0e0e0;
    align-items: center;
  }

  .card_msg .card_bank .card_kinds div:last-child {
    border-bottom: none;
  }

  .card_msg .card_bank .card_kinds .card_record img {
    display: inline-block;
    width: 72px;
    height: 72px;
    align-items: center;
    padding-right: 24px;
  }

  .card_msg .card_bank .card_kinds .card_record span {
    display: block;
    font-size: 28px;
    color: #888;
    line-height: 40px;
  }

  .card_msg .card_bank .card_kinds .card_record span:first-child {
    color: #333;
  }

  .sel_btn {
    box-sizing: border-box;
    width: 702px;
    padding: 22px 0 56px 22px;
  }

  .sel_btn .sel_explain {
    padding-left: 46px;
    color: #888;
  }

  .bottom_text{
    color: #333333;
  }
  .weixin_bottom_text{
    color: #19293F;
  }
  .bottom_text_a{
    color: #4499FF;
  }
  .weixin_bottom_text_a{
    color: #576B95;
  }
  .large_btn {
    box-sizing: border-box;
    width: 702px;
  }
  .weixin_large_btn .van-button--large {
    font-family: PingFangSC-Regular;
    height: 80px;
    color: #fff;
    border-radius: 6px;
    font-size: 34px;
    background-color: #1DCD97;
  }

  .large_btn .van-button--large {
    font-family: PingFangSC-Regular;
    height: 80px;
    background-color: #4499ff;
    color: #fff;
    border-radius: 6px;
    font-size: 34px;
  }

  .van-checkbox {
    line-height: 32px;
    padding-bottom: 24px;
    overflow: visible !important;
  }

  .van-checkbox__icon {
    height: 32px !important;
  }

  .van-checkbox .van-checkbox__icon .van-icon {
    width: 30px;
    height: 30px;
  }

  .van-checkbox__icon--round .van-icon {
    border: 2px solid #ccc !important;
  }

  .van-icon, .van-icon::before {
    padding-top: 1px;
  }

  .van-checkbox__label a {
    color: #4499ff;
  }

  .weixin_sel_btn .van-checkbox__icon--checked .van-icon {
    background-color: #1DCD97;
  }

  .van-notify, .van-toast{
    font-size: 25px !important;
    line-height: 60px !important;
  }
</style>
