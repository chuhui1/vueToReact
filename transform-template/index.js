const babylon = require('babylon')
const t = require('@babel/types')
const babelTraverse = require('@babel/traverse').default
const {
  handleIfDirective, handleShowDirective, handleOnDirective,
  handleForDirective, handleTextDirective, handleHTMLDirective,
  handleBindDirective
} = require('./directives')
const { log, getIdentifier, openAstFun, closeAst } = require('../utils');

module.exports = function traverseTemplate (template, state) {
  let argument = null
  // cache some variables are defined in v-for directive
  const definedInFor = []

  // AST for template in sfc
  const tast = babylon.parse(template, {
      sourceType: 'module',
      plugins: ['jsx']
  })

  babelTraverse(tast, {
      ExpressionStatement: {
          enter (path) {

          },
          exit (path) {
              argument = path.node.expression
          }
      },

      JSXAttribute (path) {
          const node = path.node
          const value = node.value.value

          if (!node.name) {
              return
          }
          if (node.name.name === 'class') {
              path.replaceWith(
                  t.jSXAttribute(t.jSXIdentifier('className'), node.value)
              )
              /* eslint-disable */
              return // path.stop()
          } else if (node.name.name === 'v-if') {
              handleIfDirective(path, value, state)
          } else if (node.name.name === 'v-show') {
              handleShowDirective(path, value, state)
          } else if (t.isJSXNamespacedName(node.name)) {
              // v-bind/v-on
              if (node.name.namespace.name === 'v-on') {
                  handleOnDirective(path, node.name.name.name, value)
              } else if (node.name.namespace.name === 'v-bind') {
                  handleBindDirective(path, node.name.name.name, value, state)
              }
          } else if (node.name.name === 'v-for') {
              handleForDirective(path, value, definedInFor, state)
          } else if (node.name.name === 'v-text') {
              // handleTextDirective(path, value, state)
              path.remove()
          } else if (node.name.name === 'v-html') {
              // handleHTMLDirective(path, value, state)
          }
      },
      
      JSXExpressionContainer (path) {   
          const expression = path.node.expression
          const name = expression.name
          
          if (t.isBinaryExpression(expression)) {
              // log('[vue-to-react]: Maybe you are using filter expression, but vtr is not supports it.')
              return
          }

          // from computed
          if (state.computeds[name]) {
              return
          }
          if (name && !definedInFor.includes(name) && path.container && expression.type == 'Identifier') {

            path.replaceWith(
                t.jSXExpressionContainer(t.memberExpression(
                    t.memberExpression(t.thisExpression(), getIdentifier(state, name)),
                    t.identifier(name)
                ))
            )
          }
          // this.state + data
          if(t.isMemberExpression(expression)) {
            let arr = []
            openAstMemberExpression(expression,arr,true)
          }  
          // Expression
          function openAstMemberExpression(expressionAst, nameArr, istrue, expression) {
            if(expressionAst.object) {
              if(expressionAst.property.name === undefined) {
                return
              }
              nameArr.push(expressionAst.property.name)
              openAstMemberExpression(expressionAst.object, nameArr, istrue, expression)                    
            } else {
              if(expressionAst.name === undefined) {
                return
              }
              nameArr.push(expressionAst.name)
              if(!definedInFor.includes(expressionAst.name)) {
                
                if(istrue) {
                  closeAstMemberExpression(nameArr)
                } else {
                  closeAstConditionalExpression(nameArr, expression)
                }
              }         
            }
          }
          // MemberExpression
          function closeAstMemberExpression(arr) {
            const arrReverse = arr.reverse()
            let astString = `t.memberExpression(t.thisExpression(), getIdentifier(state, '${arr[0]}')`
            for(let i = 0; i < arrReverse.length; i++) {
              astString = `t.memberExpression(${astString}),t.identifier('${arr[i]}')`
            }
            astString = `${astString})`
            path.replaceWith(
              t.jSXExpressionContainer(
                eval(astString)
              )
            )
            
          }
          // ConditionalExpression
          function closeAstConditionalExpression(arr, expression) {
            const arrReverse = arr.reverse()
            let astString = `t.memberExpression(t.thisExpression(), getIdentifier(state, '${arr[0]}')`
            for(let i = 0; i < arrReverse.length; i++) {
              astString = `t.memberExpression(${astString}),t.identifier('${arr[i]}')`
            }
            astString = `${astString})`
            path.replaceWith(
              t.jSXExpressionContainer(
                t.ConditionalExpression(
                  eval(astString),
                  expression.consequent,
                  expression.alternate
                )
                
              )
            )
            
          }
          if(t.isConditionalExpression && expression.test) {
            if(expression.test.type !== 'UnaryExpression') {
              let arr = []
              openAstMemberExpression(expression.test,arr,false,expression)
            }
            
          }
      }
  })
  return argument
}
