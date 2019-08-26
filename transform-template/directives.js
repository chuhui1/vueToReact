const t = require('@babel/types')
const eventMap = require('./event-map')
const { log, getIdentifier } = require('../utils')

function getNextJSXElment (path) {
  let nextElement = null
  for (let i = path.key + 1; ; i++) {
      const nextPath = path.getSibling(i)
      if (!nextPath.node) {
          break
      } else if (t.isJSXElement(nextPath.node)) {
          nextPath.traverse({
              JSXAttribute (p) {
                  if (p.node.name.name === 'v-else') {
                      isHaveElse = true
                      nextElement = nextPath.node
                      p.remove()
                      nextPath.remove()
                  }
              }
          })
          break
      }
  }
  return nextElement
}
// 解析嵌套数据
function handleValue (value) {
    if (value.split('.')[0]) {
        return value.split('.')[0]
    }
    return value
}

exports.handleIfDirective = function handleIfDirective (path, value, state) {

  const parentPath = path.parentPath.parentPath
  const childs = parentPath.node.children
  let dataValue = handleValue(value)
  // Get JSXElment of v-else
  const nextElement = getNextJSXElment(parentPath)
  if(value.indexOf('!') === 0) {
    value = value.substr(1)
    parentPath.replaceWith(
      t.jSXExpressionContainer(
        t.conditionalExpression(
          t.unaryExpression(
            "!",
            t.memberExpression(
              t.memberExpression(t.thisExpression(), getIdentifier(state, dataValue)),
              t.identifier(value)
            )
          ),
          parentPath.node,
          nextElement ? nextElement : t.nullLiteral()
        )
      )
    )
  } else {
    parentPath.replaceWith(
      t.jSXExpressionContainer(
        t.conditionalExpression(
          t.memberExpression(
            t.memberExpression(t.thisExpression(), getIdentifier(state, dataValue)),
            t.identifier(value)
          ),
          parentPath.node,
          nextElement ? nextElement : t.nullLiteral()
        )
      )
    )
  }
  path.remove()
}

exports.handleShowDirective = function handleShowDirective (path, value, state) {
  let dataValue = handleValue(value)
  path.replaceWith(
      t.jSXAttribute(
          t.jSXIdentifier('style'),
          t.jSXExpressionContainer(
              t.objectExpression([
                  t.objectProperty(
                      t.identifier('display'),
                      t.conditionalExpression(
                          t.memberExpression(
                              t.memberExpression(t.thisExpression(), getIdentifier(state, dataValue)),
                              t.identifier(value)
                          ),
                          t.stringLiteral('block'),
                          t.stringLiteral('none')
                      )
                  )
              ])
          )
      )
  )
}

exports.handleOnDirective = function handleOnDirective (path, name, value) {
  const eventName = eventMap[name]
  if (!eventName) {
      log(`Not support event name`)
      return
  }

  path.replaceWith(
      t.jSXAttribute(
          t.jSXIdentifier(eventName),
          t.jSXExpressionContainer(
              t.memberExpression(
                  t.thisExpression(),
                  t.identifier(value)
              )
          )
      )
  )
}

exports.handleBindDirective = function handleBindDirective (path, name, value, state) {
  let dataValue = handleValue(value)
  if (name === 'class') {
      let classProperty = value
      const classNameList = []
      classProperty = classProperty.replace(/{/g, '').replace(/}/g, '').replace(/\s/g, '').split(',')
      classProperty.forEach(item => {
        let memThis = 'this'
        const memKey = item.split(':')[0]
        let memValue = item.split(':')[1]
        if (memValue.indexOf('!') > -1) {
            memValue = memValue.split('')
            memValue.splice(0,1)
            memValue = memValue.join('')
            memThis = '!this'
        }
        let dataValue = handleValue(memValue)
        classNameList.push(
            t.conditionalExpression(
                t.memberExpression(
                    t.memberExpression(t.identifier(memThis), getIdentifier(state, dataValue)),
                    t.identifier(memValue)
                ),
                t.identifier(memKey),
                t.nullLiteral()
            )
        )
      })
      path.replaceWith(
          t.jSXAttribute(
              t.jSXIdentifier(name),
              t.jSXExpressionContainer(
                  t.callExpression(
                    t.memberExpression(t.arrayExpression(classNameList), t.identifier('join')),
                    [t.stringLiteral(' ')]
                  )
              )
          )
      )
      return
  }
  if (state.computeds[value]) {
      path.replaceWith(
          t.jSXAttribute(
              t.jSXIdentifier(name),
              t.jSXExpressionContainer(t.identifier(value))
          )
      )
      return
  }
  path.replaceWith(
      t.jSXAttribute(
          t.jSXIdentifier(name),
          t.jSXExpressionContainer(
              t.memberExpression(
                  t.memberExpression(t.thisExpression(), getIdentifier(state, dataValue)),
                  t.identifier(value)
              )
          )
      )
  )
}

exports.handleForDirective = function handleForDirective (path, value, definedInFor, state) {
  const parentPath = path.parentPath.parentPath
  const childs = parentPath.node.children
  const element = parentPath.node.openingElement.name.name

  const a = value.split(/\s+?in\s+?/)
  const prop = a[1].trim()
  let dataValue = handleValue(prop)

  const params = a[0].replace('(', '').replace(')', '').split(',')
  const newParams = []
  const jsxAttrList = []
  params.forEach(item => {
      definedInFor.push(item.trim())
      newParams.push(t.identifier(item.trim()))
  })

  path.remove()
  parentPath.traverse({
    JSXAttribute(memPath) {
        const node = memPath.node
        let jsxAttrKey = t.isJSXNamespacedName(node.name) ? node.name.name.name : node.name.name
        let jsxAttrval = node.value
        const objectAttr = {}
        objectAttr[jsxAttrKey] = jsxAttrval
        if (jsxAttrKey === 'key') return
        this.jsxAttrList.push(objectAttr)
    }
  }, {jsxAttrList})
  function appendJsxAttr(jsxAttrList) {
      const list = [
        t.jSXAttribute(
            t.jSXIdentifier('key'),
            t.jSXExpressionContainer(
                t.identifier('index')
            )
        )
      ]
      jsxAttrList.forEach(item => {
        const key = Object.keys(item)[0]
        const value = item[key]
        list.push(
            t.jsxAttribute(
                t.jsxIdentifier(key),
                value
            )
        )
      })
      return list
  }
  parentPath.replaceWith(
      t.jSXExpressionContainer(
          t.callExpression(
              t.memberExpression(
                  t.memberExpression(
                      t.memberExpression(t.thisExpression(), getIdentifier(state, dataValue)),
                      t.identifier(prop)
                  ),
                  t.identifier('map')
              ),
              [
                  t.arrowFunctionExpression(
                      newParams,
                      t.blockStatement([
                          t.returnStatement(
                              t.jSXElement(
                                  t.jSXOpeningElement(t.jSXIdentifier(element), appendJsxAttr(jsxAttrList)),
                                  t.jSXClosingElement(t.jSXIdentifier(element)),
                                  childs
                              )
                          )
                      ])
                  )
              ]
          )
      )
  )
}

exports.handleTextDirective = function handleTextDirective (path, value, state) {
  const parentPath = path.parentPath.parentPath

  if (state.computeds[value]) {
      parentPath.node.children.push(
          t.jSXExpressionContainer(
              t.callExpression(
                  t.memberExpression(
                      t.identifier(value),
                      t.identifier('replace')
                  ),
                  [
                      t.regExpLiteral('<[^>]+>', 'g'),
                      t.stringLiteral('')
                  ]
              )
          )
      )
      return
  }

  parentPath.node.children.push(
      t.jSXExpressionContainer(
          t.callExpression(
              t.memberExpression(
                  t.memberExpression(
                      t.memberExpression(t.thisExpression(), getIdentifier(state, value)),
                      t.identifier(value)
                  ),
                  t.identifier('replace')
              ),
              [
                  t.regExpLiteral('<[^>]+>', 'g'),
                  t.stringLiteral('')
              ]
          )
      )
  )
}

exports.handleHTMLDirective = function handleHTMLDirective (path, value, state) {
  path.replaceWith(
      t.jSXAttribute(
          t.jSXIdentifier('dangerouslySetInnerHTML'),
          t.jSXExpressionContainer(
              t.objectExpression(
                  [
                      t.objectProperty(t.identifier('__html'), t.memberExpression(
                          t.memberExpression(t.thisExpression(), getIdentifier(state, value)),
                          t.identifier(value)
                      ))
                  ]
              )
          )
      )
  )
}
