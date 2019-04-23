const { ReferenceRenderer } = require('../../lib/renderers');

const assets = {
  'main.js': {
    source: () => 'console.log()'
  },
  'style.css': {
    source: () => '.class { color: #000 }'
  },
}

describe('render', () => {  
  it('renders javascript', () => {
    const renderFunction = new ReferenceRenderer(assets, '').render()
    
    expect(renderFunction('main.js'))
      .toEqual('<script type="text/javascript" src="main.js"></script>')
  })

  it('renders css', () => {
    const renderFunction = new ReferenceRenderer(assets, '').render()
    
    expect(renderFunction('style.css'))
      .toEqual('<link rel="stylesheet" href="style.css"/>')
  })

  it('can use a prefix public path', () => {
    const renderFunction = new ReferenceRenderer(assets, 'https://example.test/').render()

    expect(renderFunction('style.css'))
      .toEqual('<link rel="stylesheet" href="https://example.test/style.css"/>')
  })

  it('can use a prefix public path', () => {
    const publicPathFunction = asset => `//test.cdn/${asset}`
    const renderFunction = new ReferenceRenderer(assets, publicPathFunction).render()

    expect(renderFunction('style.css'))
      .toEqual('<link rel="stylesheet" href="//test.cdn/style.css"/>')
  })
})
