const Renderer = require('./renderer')

class ReferenceRenderer extends Renderer {
  js ({ assetName }) {
    return `<script type="text/javascript" src="${this.getAssetPublicPath(assetName)}"></script>`
  }

  css ({ assetName }) {
    return `<link rel="stylesheet" href="${this.getAssetPublicPath(assetName)}"/>`
  }
}

module.exports = ReferenceRenderer
