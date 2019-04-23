jest.mock('html-minifier')
jest.mock('fs')

const StaticComponentEnveloper = require('../lib')

describe('constructor', () => {
  it('sets default attributes', () => {
    const enveloper = new StaticComponentEnveloper({})

    expect(enveloper.name).toEqual('envelope.json')
    expect(enveloper.head).toEqual([])
    expect(enveloper.bodyInline).toEqual([])
    expect(enveloper.bodyLast).toEqual([])
    expect(enveloper.minificationOptions).toEqual(false)
  })
})

describe('setupMinification', () => {
  it('minification is disabled by default', () => {
    const enveloper = new StaticComponentEnveloper({})
    
    expect(enveloper.minificationOptions).toEqual(false)
  })

  it('uses default minification options if true is passed', () => {
    const enveloper = new StaticComponentEnveloper({ minify: true })
    
    expect(enveloper.minificationOptions).toEqual({
      collapseWhitespace: true,
      conservativeCollapse: true,
    })
  })

  it('uses custom options if object is passed', () => {
    const enveloper = new StaticComponentEnveloper({ minify: { custom: 'options' }  })

    expect(enveloper.minificationOptions).toEqual({ custom: 'options' })
  })
})

describe('getCompilationPublicPath', () => {
  it('defaults to / if the publicPath option is not passed', () => {
    const enveloper = new StaticComponentEnveloper({})
    const compilation = {
      options: {
        output: {}
      }
    } 

    expect(enveloper.getCompilationPublicPath(compilation)).toEqual('/')
  })

  it('returns the option passed by the user if passed', () => {
    const enveloper = new StaticComponentEnveloper({})
    const compilation = {
      options: {
        output: {
          publicPath: 'https://example.test/'
        }
      }
    } 

    expect(enveloper.getCompilationPublicPath(compilation)).toEqual('https://example.test/')
  })
})

describe('addAsset', () => {
  it('adds the asset to the compilation object', () => {
    const enveloper = new StaticComponentEnveloper({})
    const compilation = { assets: {} }
    enveloper.addAsset(compilation, {
      name:   'envelope.json',
      source: 'envelope content',
    })

    expect(compilation.assets.hasOwnProperty('envelope.json')).toBeTruthy()
  })

  it('creates an assets object', () => {
    const enveloper = new StaticComponentEnveloper({})
    const compilation = { assets: {} }
    enveloper.addAsset(compilation, {
      name:   'envelope.json',
      source: 'envelope content',
    })
    const asset = compilation.assets['envelope.json']

    expect(asset.source()).toEqual('envelope content')
    expect(asset.size()).toEqual(16)
  }) 
})

describe('buildEnvelope', () => {
  it('calls the envelope componets build methods', () => {
    const enveloper = new StaticComponentEnveloper({})
    enveloper.buildHead       = jest.fn()
    enveloper.buildBodyInline = jest.fn()
    enveloper.buildBodyLast   = jest.fn()
    enveloper.buildEnvelope('assets')

    expect(enveloper.buildHead).toBeCalledWith('assets')
    expect(enveloper.buildBodyInline).toBeCalledWith('assets')
    expect(enveloper.buildBodyLast).toBeCalledWith('assets')
  })

  it('calls the envelope componets build methods', () => {
    const enveloper = new StaticComponentEnveloper({})
    enveloper.buildHead       = jest.fn(() => ['head'])
    enveloper.buildBodyInline = jest.fn(() => 'body inline')
    enveloper.buildBodyLast   = jest.fn(() => ['body last'])

    expect(enveloper.buildEnvelope())
      .toEqual('{"head":["head"],"bodyInline":"body inline","bodyLast":["body last"]}')
  })
})

describe('buildHead', () => {
  it('calls the asseble method with the correct parameters', () => {
    const enveloper = new StaticComponentEnveloper({ head: ['head'] })
    enveloper.assemble = jest.fn()
    enveloper.buildHead('assets')
    
    expect(enveloper.assemble).toBeCalledWith(['head'], 'assets')
  })
})

describe('buildBodyInline', () => {
  it('calls the asseble method with the correct parameters', () => {
    const enveloper = new StaticComponentEnveloper({ bodyInline: ['bodyInline'] })
    enveloper.assemble = jest.fn(() => [])
    enveloper.buildBodyInline('assets')
    
    expect(enveloper.assemble).toBeCalledWith(['bodyInline'], 'assets')
  })
  
  it('returns single string', () => {
    const enveloper = new StaticComponentEnveloper({ bodyInline: ['bodyInline'] })
    enveloper.assemble = jest.fn(() => ['a', 'b', 'c'])

    expect(enveloper.buildBodyInline('assets')).toEqual('abc')
  })
})

describe('buildBodyLast', () => {
  it('calls the asseble method with the correct parameters', () => {
    const enveloper = new StaticComponentEnveloper({ bodyLast: ['bodyLast'] })
    enveloper.assemble = jest.fn()
    enveloper.buildBodyLast('assets')
    
    expect(enveloper.assemble).toBeCalledWith(['bodyLast'], 'assets')
  })
})

describe('assemble', () => {
  it('', () => {
    const enveloper = new StaticComponentEnveloper({})
    const renderFunction = jest.fn()
    enveloper.loadTemplate = jest.fn()
    enveloper.render       = () => renderFunction
    enveloper.minify       = jest.fn()
    enveloper.assemble(['a', 'b', 'c'])

    expect(enveloper.loadTemplate).toBeCalledTimes(3)
    expect(renderFunction).toBeCalledTimes(3)
    expect(enveloper.minify).toBeCalledTimes(3)
  })
})

describe('loadTemplates', () => {
  const readFileSyncMock = require('fs').readFileSync
  beforeEach(() => {
    readFileSyncMock.mockReset()
  })
  
  it('loads reasd the file with appropriate encoding', () => {
    const enveloper = new StaticComponentEnveloper({})
    enveloper.loadTemplate('template.mustache')
    
    expect(readFileSyncMock).toBeCalledWith('template.mustache', 'utf-8')
  })

  it('returns the file content', () => {
    const enveloper = new StaticComponentEnveloper({})
    readFileSyncMock.mockReturnValue('content')
    
    expect(enveloper.loadTemplate('template.mustache')).toEqual('content')
  })

  it('throws an error if the file does not exist', () => {
    const enveloper = new StaticComponentEnveloper({})
    readFileSyncMock.mockImplementation(() => { throw new Error() })

    expect(() => enveloper.loadTemplate('template.mustache'))
      .toThrow('Can not find such template template.mustach')
  })
})


describe('render', () => {
  const assets = {
    'index.js': {
      source: () => 'console.log("test")'
    },
    'style.css': {
      source: () => '.class { color: #000 }'
    },
    'image.png': {}
  }
  
  it('returns a function', () => {
    expect(typeof(new StaticComponentEnveloper({}).render({}))).toEqual('function')
  })

  it('does not change the template if it does not have includes', () => {
    const renderFunction = new StaticComponentEnveloper({}).render(assets)

    expect(renderFunction('plain template')).toEqual('plain template')
  })

  it('can inline an asset', () => {
    const renderFunction = new StaticComponentEnveloper({}).render(assets)

    expect(renderFunction('{{#inline}}index.js{{/inline}}'))
      .toEqual('<script type="text/javascript">console.log("test")</script>')
  })

  it('can inline multiple assets', () => {
    const renderFunction = new StaticComponentEnveloper({}).render(assets)

    expect(renderFunction('{{#inline}}index.js{{/inline}}\n{{#inline}}style.css{{/inline}}'))
      .toEqual('<script type="text/javascript">console.log("test")</script>\n<style>.class { color: #000 }</style>')
  })

  it('can reference an asset', () => {
    const enveloper = new StaticComponentEnveloper({})
    enveloper.publicPath = ''
    const renderFunction = enveloper.render(assets)
    
    
    expect(renderFunction('{{#reference}}index.js{{/reference}}'))
      .toEqual('<script type="text/javascript" src="index.js"></script>')
  })

  it('can reference multiple assets', () => {
    const enveloper = new StaticComponentEnveloper({})
    enveloper.publicPath = ''
    const renderFunction = enveloper.render(assets)

    expect(renderFunction('{{#reference}}index.js{{/reference}}\n{{#reference}}style.css{{/reference}}'))
      .toEqual('<script type="text/javascript" src="index.js"></script>\n<link rel="stylesheet" href="style.css"/>')
  })

  it('can mix referencing and inlining in single template', () => {
    const enveloper = new StaticComponentEnveloper({})
    enveloper.publicPath = ''
    const renderFunction = enveloper.render(assets)

    expect(renderFunction('{{#reference}}index.js{{/reference}}\n{{#inline}}style.css{{/inline}}'))
      .toEqual('<script type="text/javascript" src="index.js"></script>\n<style>.class { color: #000 }</style>')
  })

  it('throws an exception if the asset does not exist', () => {
    const renderFunction = new StaticComponentEnveloper({}).render(assets)

    expect(() => renderFunction('{{#reference}}missing.js{{/reference}}'))
      .toThrow('Could not find asset called missing.js')
  })

  it('throws an exception if the asset type is not supported', () => {
    const renderFunction = new StaticComponentEnveloper({}).render(assets)

    expect(() => renderFunction('{{#reference}}image.png{{/reference}}'))
      .toThrow('Unsupported asset type png')
  })

  it('throw an exception if the asset type is not supported', () => {
    const enveloper = new StaticComponentEnveloper({})
    enveloper.publicPath = 1
    const renderFunction = enveloper.render(assets)

    expect(() => renderFunction('{{#reference}}index.js{{/reference}}'))
      .toThrow('Unsupported publicPath of type number')
  })
})


describe('minfy', () => {
  const minifyMock = require('html-minifier').minify
  
  beforeEach(() => {
    minifyMock.mockReset()
  })
  
  it('returns the same asset if minifiation is disabled', () => {
    const enveloper = new StaticComponentEnveloper({ minify: false })

    expect(enveloper.minify('content')).toEqual('content')
  })

  it('calls the minification function with the correct set of arguments', () => {
    const enveloper = new StaticComponentEnveloper({ minify: {} })
    enveloper.minify('content')
    
    expect(minifyMock).toBeCalledWith('content', {})
  })

  it('minifies the content', () => {
    const enveloper = new StaticComponentEnveloper({ minify: true })
    minifyMock.mockReturnValue('minified content')

    expect(enveloper.minify('content')).toEqual('minified content')
  })
})
