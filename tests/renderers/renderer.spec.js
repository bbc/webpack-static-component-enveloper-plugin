const { Renderer } = require('../../lib/renderers');

describe('render', () => {
  it('returns a function ', () => {
    expect(typeof (new Renderer({}, '').render())).toBe('function')
  })

  it('throws an exception if the file type is not supported', () => {
    const renderFunction = new Renderer({}, '').render()

    expect(() => renderFunction('asset.banana'))
      .toThrow('Unsupported asset type banana')
  })

  it('throws an exception if the specified asset is missing', () => {
    const renderer = new Renderer({}, '')
    renderer.js = jest.fn();
    const renderFunction = renderer.render();

    expect(() => renderFunction('banana.js'))
      .toThrow('Could not find asset called banana.js')
  })

  it('calls the right format function with expected arguments', () => {
    const assets = {
      'main.js': { source: () => 'console.log()' }
    }
    const renderer = new Renderer(assets, '')
    renderer.js = jest.fn()
    renderer.render()('main.js');

    expect(renderer.js).toBeCalledWith({
      assetName:   'main.js',
      assetSource: 'console.log()'
    })
  })
})

describe('getAssetPublicPath', () => {
  it('throws an exception if the publicPath type is not supported', () => {
    const renderer = new Renderer({}, 1)

    expect(() => renderer.getAssetPublicPath('asset.js'))
      .toThrow('Unsupported publicPath of type number')
  })

  it('uses the publicPath as prefix if it is a string', () => {
    const renderer = new Renderer({}, 'https://example.test/')

    expect(renderer.getAssetPublicPath('asset.js'))
      .toEqual('https://example.test/asset.js')
  })

  it('uses the publicPath as prefix if it is a string', () => {
    const renderer = new Renderer({}, (asset) => `https://example.test/${asset}?dynamic`)

    expect(renderer.getAssetPublicPath('asset.js'))
      .toEqual('https://example.test/asset.js?dynamic')
  })
})
