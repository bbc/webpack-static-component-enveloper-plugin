const path = require('path')

class Renderer {
  constructor (assets, publicPath) {
    this.assets     = assets
    this.publicPath = publicPath
  }

  render () {
    return assetName => {
      const extension = path.extname(assetName).substring(1)
      if (!this[extension]) throw `Unsupported asset type ${extension}`
      if (!this.assets[assetName]) throw `Could not find asset called ${assetName}`

      const assetSource = this.assets[assetName].source().toString()
      return this[extension]({ assetName, assetSource })
    }
  }

  getAssetPublicPath (assetName) {
    const publicPathType = typeof(this.publicPath)
    if (publicPathType === 'string')
      return `${this.publicPath}${assetName}`
    else if (publicPathType === 'function')
      return this.publicPath(assetName)
    else
      throw new TypeError(`Unsupported publicPath of type ${publicPathType}`)
  }
}

module.exports = Renderer
