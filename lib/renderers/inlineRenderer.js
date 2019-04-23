const Renderer = require('./renderer')

class InlineRenderer extends Renderer {
  js ({ assetSource }) {
    return `<script type="text/javascript">${assetSource}</script>`
  }

  css ({ assetSource }) {
    return `<style>${assetSource}</style>`
  }
}

module.exports = InlineRenderer
