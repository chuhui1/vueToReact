const t = require('@babel/types')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const { log, getIdentifier, genPropTypes, genDefaultProps } = require('./utils')

const appPath = process.cwd()

// ImportDeclarationTaro
exports.ImportDeclaration = function ImportDeclaration(vast, collect = {}, state = {}) {
    traverse(vast, {
        ImportDeclaration(path) {
          collect.imports.push(path.node)
        },
    })

    const ImportDeclarationTaro = t.importDeclaration([
        t.importDefaultSpecifier(t.identifier('Taro')),
        t.importSpecifier(t.identifier('Component'), t.identifier('Component'))
    ], t.stringLiteral('@tarojs/taro'))
    if (Object.keys(state.props).length) {
        const importPropTypes = t.importDeclaration(
            [
                t.importDefaultSpecifier(t.identifier('PropTypes'))
            ],
            t.stringLiteral('prop-types')
        )
        collect.imports.push(importPropTypes)
    }

    collect.imports.push(ImportDeclarationTaro)

}

exports.ImportDeclarationLess = function ImportDeclarationLess(src) {
    const ImportDeclarationLess = t.importDeclaration([], t.stringLiteral(src))
    return ImportDeclarationLess
}

exports.ExportDeclatationDefault = function ExportDeclatationDefault(exportId) {
    const exportDefaultDeclaration = t.exportDefaultDeclaration(t.Identifier(exportId))
    return exportDefaultDeclaration
}

// 生成 ClassDeclaration
exports.ClassDeclaration = function ClassDeclaration(argument, vast, classId, collect = {}, state = {}, cycle = {}) {
    const id = t.identifier(classId)
    const superClass = t.identifier('Component')
    const classBody = []
    // 生成 classBody => ClassProperty
    let ObjectExpression
    traverse(vast, {
        AssignmentExpression(path) {
            const parent = path.parentPath.parent
            if (path.node.left.name === 'config' && !t.isExportDefaultDeclaration(parent)) {
                ObjectExpression = path.node.right
            }
        }
    })
    const ClassProperty = t.classProperty(t.identifier('config'), ObjectExpression)
    classBody.push(ClassProperty)
    classBody.push(genConstructor(state))
    if (Object.keys(state.props).length) {
        classBody.push(genPropTypes(state.props));
        classBody.push(genDefaultProps(state.props));
    }
    // 生成  classBody => classMethod 的 生命周期
    // traverse(vast, {
    //   ExportDefaultDeclaration(path) {
    //     path.node.declaration.properties.forEach(property => {
    //       classBody.push(t.classMethod('method', property.key, property.params, property.body, property.computed, property.static))
    //     })
    //   }
    // })
    traverse(vast, {
        ObjectMethod(path) {
            const name = path.node.key.name
            if (path.parentPath.parent.key && path.parentPath.parent.key.name === 'methods') {
                collect.classMethods[name] = createClassMethod(path, state, name)
            } else if (cycle[name]) {
                collect.classMethods[cycle[name]] = createClassMethod(path, state, cycle[name])
            } else {
                if (name === 'data' || state.computeds[name]) {
                    return
                }
                log(`The ${name} method maybe be not support now`)
            }
        }
    })
    if (Object.keys(collect.classMethods).length) {
        Object.keys(collect.classMethods).forEach(key => {
            classBody.push(collect.classMethods[key])
        })
    }
    classBody.push(genRenderMethod(state, argument))

    const ClassDeclarationBody = t.classBody(classBody)
    const ClassDeclaration = t.classDeclaration(id, superClass, ClassDeclarationBody)
    return ClassDeclaration
}

exports.ExpressionStatementTaro = function ExpressionStatementTaro() {
    const callee = t.memberExpression(t.Identifier('Taro'), t.identifier('render'))
    const arguments = []
    const openingElement = t.jsxOpeningElement(t.jsxIdentifier('App'), [], true)
    const jsxElement = t.jsxElement(openingElement, null, [], true)
    const CallExpression = t.callExpression(t.memberExpression(t.Identifier('document'), t.identifier('getElementById')), [t.stringLiteral('app')])
    arguments.push(jsxElement)
    arguments.push(CallExpression)
    const expression = t.callExpression(callee, arguments)
    const ExpressionStatementTaro = t.expressionStatement(expression)
    return ExpressionStatementTaro
}

function genRenderMethod(state, argument) {
    const computedProps = Object.keys(state.computeds);
    let blocks = []
    if (computedProps.length) {
        computedProps.forEach(prop => {
            const v = state.computeds[prop];
            blocks = blocks.concat(v['_statements']);
        });
    }
    blocks = blocks.concat(t.returnStatement(argument))

    const render = t.classMethod(
        'method',
        t.identifier('render'),
        [],
        t.blockStatement(blocks)
    )
    return render
}

function genConstructor(state) {
    const blocks = [
        t.expressionStatement(t.callExpression(t.super(), [t.identifier('props')]))
    ]
    if (state.data['_statements']) {
        state.data['_statements'].forEach(node => {
            if (t.isReturnStatement(node)) {
                const props = node.argument.properties
                // supports init data property with props property
                props.forEach(n => {
                    if (t.isMemberExpression(n.value)) {
                        n.value = t.memberExpression(t.identifier('props'), t.identifier(n.value.property.name))
                    }
                })

                blocks.push(
                    t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.thisExpression(), t.identifier('state')), node.argument))
                )
            } else {
                blocks.push(node)
            }
        })
    }
    const ctro = t.classMethod(
        'constructor',
        t.identifier('constructor'),
        [t.identifier('props')],
        t.blockStatement(blocks)
    )
    return ctro
}

const nestedMethodsVisitor = {
    VariableDeclaration(path) {
        const declarations = path.node.declarations
        declarations.forEach(d => {
            if (t.isMemberExpression(d.init)) {
                const key = d.init.property.name
                d.init.object = t.memberExpression(t.thisExpression(), getIdentifier(this.state, key))
            }
        })
        this.blocks.push(path.node)
    },

    ExpressionStatement(path) {
        const expression = path.node.expression
        if (t.isAssignmentExpression(expression)) {
            const right = expression.right
            const letfNode = expression.left.property
            path.node.expression = t.callExpression(
                t.memberExpression(t.thisExpression(), t.identifier('setState')),
                [t.objectExpression([
                    t.objectProperty(letfNode, right)
                ])]
            )
        }

        if (t.isCallExpression(expression) && !t.isThisExpression(expression.callee.object)) {
            path.traverse({
                ThisExpression(memPath) {
                    const key = memPath.parent.property.name
                    memPath.replaceWith(
                        t.memberExpression(t.thisExpression(), getIdentifier(this.state, key))
                    )
                    memPath.stop()
                }
            }, { state: this.state })
        }

        this.blocks.push(path.node)
    },

    ReturnStatement(path) {
        path.traverse({
            ThisExpression(memPath) {
                const key = memPath.parent.property.name
                memPath.replaceWith(
                    t.memberExpression(t.thisExpression(), getIdentifier(this.state, key))
                )
                memPath.stop()
            }
        }, { state: this.state })
        this.blocks.push(path.node)
    }
}
function createClassMethod(path, state, name) {
    const body = path.node.body
    const blocks = []
    let params = []

    if (name === 'componentDidCatch') {
        params = [t.identifier('error'), t.identifier('info')]
    }
    path.traverse(nestedMethodsVisitor, { blocks, state })
    return t.classMethod('method', t.identifier(name), params, t.blockStatement(blocks))
}
