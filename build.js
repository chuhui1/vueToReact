const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

const compiler = require('vue-template-compiler')
const babylon = require('babylon')
const t = require('@babel/types')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const { ImportDeclaration, ImportDeclarationLess, ClassDeclaration,
	ExpressionStatementTaro, ExportDeclatationDefault } = require('./taro-declarate')
const traverseTemplate = require('./transform-template/index')
const { initProps, initData, initComputed, initComponents } = require('./state-collect')
const { log, parseComponentName } = require('./utils');
const output = require('./output');

const appPath = process.cwd()

const pages = []

function transform(src, type, page = '') {
	const state = {
		name: undefined,
		data: {},
		props: {},
		computeds: {},
		components: {}
	}

	// Life-cycle methods relations mapping
	const cycle = {
		'created': 'componentWillMount',
		'mounted': 'componentDidMount',
		'updated': 'componentDidUpdate',
		'beforeDestroy': 'componentWillUnmount',
	}

	const collect = {
		imports: [],
		classMethods: {}
	}

	const enteyFileContent = fs.readFileSync(src, 'utf-8').toString()
	const res = compiler.parseComponent(enteyFileContent, { pad: 'line' })
	const scriptCode = res.script.content.replace(/\/\//g, '').trim()
	const template = res.template.content.replace(/{{/g, '{').replace(/}}/g, '}')
	const styleArr = res.styles[0].content.trim()
	let lessSrc
	let classId
	let targetPath

	const ast = babylon.parse(scriptCode, {
		sourceType: 'module',
		plugins: ['flow']
	})
	if (type === 'entry') {
		traverse(ast, {
			ObjectProperty(path) {
				if (path.node.key.name === 'pages') {
					path.node.value.elements.forEach(property => {
						pages.push(property.value)
					})
				}
			}
		})
		lessSrc = './app.less'
		classId = 'App'
		fs.writeFileSync(path.join(appPath, 'src/app.less'), styleArr)
	} else {
		lessSrc = `./${page.split('/')[1]}.less`
		classId = page.split('/')[1].toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
		fs.writeFileSync(`${path.join(appPath, `src/${page}`).replace(/\/{2,}/g, '/')}.less`, styleArr)
	}

	let renderArgument = null

	const appCode = ''
	const pageAst = babylon.parse(appCode)

	initProps(ast, state)
  initData(ast, state)
  initComputed(ast, state)
	initComponents(ast, state)
	renderArgument = traverseTemplate(template, state)

	ImportDeclaration(ast, collect, state)
	collect.imports.forEach(node => pageAst.program.body.unshift(node))
	pageAst.program.body.push(ImportDeclarationLess(lessSrc))
	pageAst.program.body.push(ClassDeclaration(renderArgument, ast, classId, collect, state, cycle))
	pageAst.program.body.push(ExportDeclatationDefault(classId))
	if(type === 'entry') {
		pageAst.program.body.push(ExpressionStatementTaro())
	}
	traverse(pageAst, {
		ClassMethod (path) {
			if (path.node.key.name === 'render') {
				path.traverse({
					JSXIdentifier (path) {
						if (t.isJSXClosingElement(path.parent) || t.isJSXOpeningElement(path.parent)) {
							const node = path.node
							const componentName = state.components[node.name] || state.components[parseComponentName(node.name)]
							if (componentName) {
								path.replaceWith(t.jSXIdentifier(componentName))
								path.stop()
							}
						}
					}
				})
			}
		}
	})

	const appOutput = generate(pageAst, {
		quotes: 'single',
		retainLines: true
	}, appCode)
	if (type === 'entry') {
		targetPath = path.join(appPath, 'src/app.js')
		output(appOutput.code, targetPath)
	} else {
		targetPath = `${path.join(appPath, `src/${page}`).replace(/\/{2,}/g, '/')}.js`
		output(appOutput.code, targetPath)
	}
}

async function buildEntry() {
	try {
		const entryFileNamePath = path.join(appPath, 'src/app.vue')

		if (!fs.existsSync(entryFileNamePath)) return

		transform(entryFileNamePath, 'entry')
	} catch (err) {
		console.log(err)
	}
}

// buildEntry()
// buildPages()
async function buildPages() {
	try {
		const pagesPromises = pages.map(async page => {
			return buildSinglePage(page)
		})
		await Promise.all(pagesPromises)
	} catch (error) {
		console.log(error)
	}
}

async function buildSinglePage(page) {
	try {
		const pagePath = path.join(appPath, `src/${page}`)
		const pageFileNamePath = `${pagePath.replace(/\/{2,}/g, '/')}.vue`

		if (!fs.existsSync(pageFileNamePath)) return

		transform(pageFileNamePath, 'singlePage', page)
	} catch (error) {
		console.log(error)
	}
}

function convert({app, page}) {
	if (app) {
		buildEntry()
	}
	if (page) {
		buildPages()
	}
}

module.exports = convert
