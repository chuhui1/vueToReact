import Taro, { Component } from '@tarojs/taro';
import CardMsg from '../../components/cardMsg';
import PayMethodList from './payMethodList';
import './index.less';
class Index extends Component {
  config = {
    navigationBarTitleText: '首页'
  };
  constructor(props) {
    super(props);
    this.state = {
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
          key: '信用卡仅用于担保预订，房费由酒店收取。'
        },
        {
          key: '酒店会在提交订单数日后或办理入住时扣去房费。'
        }
      ]
    };
  }
  componentWillMount() {}
  render() {
    return (
      <div
        className="container flexbox"
        className={[this.state.isInWeixin ? 'weixin_container' : null].join(
          ' '
        )}
      >
        {!this.props.isInWeixin ? (
          <div className="header">
            <span className="back" click={this.props.back}>
              <img
                src="../../../../assets/imgs/booking/Combined Shape@2x.png"
                alt=""
              />
            </span>
            <span className="title">{this.state.pageData}</span>
            <span className="title">{this.state.orderDetail.title}</span>
          </div>
        ) : null}

        <div
          className="hotel"
          className={[this.state.isInWeixin ? 'weixin_hotel' : null].join(' ')}
        >
          <div className="hotel_info">
            <div className="hotel_name">{this.state.orderDetail}</div>
            {this.state.orderDetail.map((item, index) => {
              return (
                <div key={index} className="hotel_time">
                  {item.name}
                  <span>{item.val}</span>
                </div>
              );
            })}
            <div
              className="line"
              className={[
                this.state.isShowHotelDetail ? 'hidden_line' : null
              ].join(' ')}
            ></div>
          </div>
          <div
            className="hotel_detail"
            className={[
              this.state.isShowHotelDetail ? 'show_detail' : null
            ].join(' ')}
          >
            {this.state.roomTitle.map((item, index) => {
              return (
                <div key={index} className="describe">
                  <span>{item.name}</span>
                  <span className="describe">{item.val}</span>
                  &nbsp;
                </div>
              );
            })}
          </div>
          <div className="hotel_pay">
            <div className="hotel_amount">
              {this.state.pageData.amountTitle}:
              <span className="span1">
                {this.state.pageData.foreignCurType}
              </span>
              <span className="span2">{this.state.pageData.foreignCur}</span>
              <span className="span3">
                (约¥{this.state.pageData.orderAmount})
              </span>
            </div>
            <div className="hotel_tips">
              实际支付金额以酒店扣款为准
              <div className="see_detail" click={this.props.seeDetail}>
                <span>
                  {this.state.isShowHotelDetail.data ? '收起详情' : '查看详情'}
                </span>
                <img
                  src="../../../../assets/imgs/booking/箭头@2x.png"
                  alt=""
                  className="arrow_bottom"
                  className={[
                    this.state.isShowHotelDetail ? 'arrow_top' : null
                  ].join(' ')}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="special_explain">
          {this.state.specialExplain.map((item, index) => {
            return (
              <div
                key={index}
                className="special_explain_icon"
                src="../../../../assets/imgs/booking/提示@2x.png"
                alt=""
                className="special_explain_title"
              >
                <span className="special_explain_icon">
                  <img
                    src="../../../../assets/imgs/booking/提示@2x.png"
                    alt=""
                  />
                </span>
                <span className="special_explain_title">{item.key}</span>
              </div>
            );
          })}
        </div>
        <div className="pay_method">
          <div className="pay_method_title">请选择以下银行卡进行担保</div>
        </div>
      </div>
    );
  }
}
export default Index;
