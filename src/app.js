import Taro, { Component } from '@tarojs/taro';

import Index from './pages/index/index';
import './app.less';
class App extends Component {
  config = {
    pages: ['pages/page1/page1'],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  };
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
  render() {
    return (
      <div>
        <Index />
      </div>
    );
  }
}
export default App;
Taro.render(<App />, document.getElementById('app'));
