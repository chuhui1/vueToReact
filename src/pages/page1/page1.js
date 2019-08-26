import Taro, { Component } from '@tarojs/taro';
import PropTypes from 'prop-types';
import ToDo from './todo';
import './your.less';
import './page1.less';
class Page1 extends Component {
  config;
  constructor(props) {
    super(props);

    const now = Date.now();
    this.state = {
      list: [1, 2, 3],
      html: '<div>1111<span>222</span>333<p>ssssss</p></div>',
      error: false,
      time: now
    };
  }
  static propTypes = { msg: PropTypes.string, imageSrc: PropTypes.string };
  static defaultProps = { msg: 'hello, sfc' };
  clickMethod() {
    console.log('click method');
  }
  testMethod() {
    console.log('call test');
  }
  componentWillMount() {
    const prevTime = this.state.time;
    this.testMethod();
    const msg = 'this is a test msg';
    this.setState({ time: Date.now() });
    console.log('mounted', msg, this.state.time);
  }
  render() {
    console.log('from computed', this.props.msg);
    const text = `${this.state.time}: ${this.state.html}`;
    return (
      <div className="wrap">
        <div>time: {this.state.time}</div>
        {this.state.error ? (
          <p>some error happend</p>
        ) : (
          <p className="name">your msg: {this.props.msg}</p>
        )}

        <p
          style={{ display: this.props.msg ? 'block' : 'none' }}
          className="shown"
        >
          test v-show
        </p>
        <p onClick={this.clickMethod}>test v-on</p>
        <img src={this.props.imageSrc} />
        <ul className="test-list">
          {this.state.list.map((value, index) => {
            return (
              <li key={index} className="list-item">
                <div>{value}</div>
                <span>{this.props.msg}</span>
              </li>
            );
          })}
        </ul>
        <ToDo msg={this.props.msg} list={this.state.list} />
      </div>
    );
  }
}
export default Page1;
