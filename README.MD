 # 使用
  + <code>npm install convert-vue-to-react -g</code> 安装包
  + <code>convert -a 或 convert --app</code> 转src 文件夹下app.vue
  + <code>convert -p 或 convert --page</code> 转src 文件夹下page文件夹

# 规范
#
* v-bind指令 不支持简写
* img标签闭合 <img src="" />
* 注释 /*注释符号*/   
* 标签指令表达式 data或者props内的变量要放在前面
#

## 已完成 ##
#### 转template模块
#
* {{}} 转成{}
* 属性名转成驼峰命名规范
* vue系统指令(v-if、v-show、v-on、v-bind、v-for等)转换
* 自定义组件名转成大写（to-do => ToDo）
#

#### script模块
#
##### class部分
* props转换
* data内容转换
* computed内容转换
* component内容转换
* 生命周期
* method转换
* 生成constructor
* 生成render
* 转换修改data元素的方式

##### import部分
* react模块的固定引入
* vue代码中写入的import
* vue代码style样式的引入

##### export部分
#

### style模块
#
* 分离style部分的代码，抽离到.less文件中
#

## 转booking遇到的问题 ##
#
### 已解决
* v-bind:class转换
* 指令出现表达式转换失败（item.val !== ''、
!isInWeixin）
* v-if 和 v-else逻辑缺陷
* v-for指令转换时子标签属性丢失
* {}中嵌套属性（{item.val}）转换失败

### 未解决
* v-for标签的子标签有v-if时，代码直接报错
* v-model转换目前还未做
* vue的watch转换
* vue状态管理（vuex）转换
#