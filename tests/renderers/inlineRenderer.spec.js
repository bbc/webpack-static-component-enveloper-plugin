const { InlineRenderer } = require('../../lib/renderers');

const assets = {
  'main.js': {
    source: () => 'console.log()'
  },
  'style.css': {
    source: () => '.class { color: #000 }'
  },
}

describe('render', () => {
  const renderFunction = new InlineRenderer(assets, '').render()
  
  it('javascript', () => {
    expect(renderFunction('main.js'))
      .toEqual('<script type="text/javascript">console.log()</script>')
  })

  it('css', () => {
    expect(renderFunction('style.css'))
      .toEqual('<style>.class { color: #000 }</style>')
  })
})
