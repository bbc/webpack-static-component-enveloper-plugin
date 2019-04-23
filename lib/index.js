const fs = require('fs')
const mustache = require('mustache')
const minifier = require('html-minifier')
const { InlineRenderer, ReferenceRenderer } = require('./renderers')

const PLUGIN_NAME = 'StaticComponentEnveloper'
const DEFAULT_MINIFICATION_OPTIONS = {
  collapseWhitespace: true,
  conservativeCollapse: true,
}

class StaticComponentEnveloper {
  constructor ({ name, head, bodyInline, bodyLast, minify }) {
    this.name                = name || 'envelope.json'
    this.head                = head || []
    this.bodyInline          = bodyInline || []
    this.bodyLast            = bodyLast || []
    this.minificationOptions = this.setupMinification(minify)
  }

  setupMinification (minificationOptions) {
    if (!minificationOptions) return false
    if (minificationOptions === true) return DEFAULT_MINIFICATION_OPTIONS
    return minificationOptions
  }
   
  apply (compiler) {
    compiler.hooks.emit.tap(PLUGIN_NAME, (compilation) => {
      this.publicPath = this.getCompilationPublicPath(compilation)
      const envelopeAsset = {
        name:   this.name,
        source: this.buildEnvelope(compilation.assets),
      }
      this.addAsset(compilation, envelopeAsset)
    })
  }

  getCompilationPublicPath (compilation) {
    return compilation.options.output.publicPath || '/'
  }

  addAsset (compilation, { name, source }) {
    compilation.assets[name] = {
      source: () => source,
      size:   () => source.length,
    }
  }

  buildEnvelope (assets) {
    return JSON.stringify({
      head:       this.buildHead(assets),
      bodyInline: this.buildBodyInline(assets),
      bodyLast:   this.buildBodyLast(assets),
    })
  }

  buildHead (assets) {
    return this.assemble(this.head, assets)
  }

  buildBodyInline (assets) {
    return this.assemble(this.bodyInline, assets).join('')
  }

  buildBodyLast (assets) {
    return this.assemble(this.bodyLast, assets)
  }

  assemble (templates, assets) {
    return templates
      .map(this.loadTemplate)
      .map(this.render(assets))
      .map(this.minify, this)
  }

  loadTemplate (templateName) {
    try {
      return fs.readFileSync(templateName, 'utf-8')
    } catch (error) {
      throw `Can not find such template ${templateName}`
    }
  }

  render (assets) {
    return template => mustache.render(
      template,
      {
        inline:    () => new InlineRenderer(assets, this.publicPath).render(),
        reference: () => new ReferenceRenderer(assets, this.publicPath).render(),
      },
    )
  }

  minify (asset) {
    return this.minificationOptions ? minifier.minify(asset, this.minificationOptions) : asset
  }
}

module.exports = StaticComponentEnveloper
