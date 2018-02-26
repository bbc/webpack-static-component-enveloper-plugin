# Static Component Enveloper Plugin

This is a [webpack](http://webpack.github.io/) plugin that simplifies creation of envelopes to serve your
static components. This plugin can automatically include your compiled CSS and JS files into the correct envelope sections. It will also automatically generate a hash for your asset files so that they are cache busted correctly.

# Installation
Run `npm install --save-dev @bbc/webpack-static-component-enveloper-plugin` to add this module to your project.

# Basic Usage
The plugin will generate an envelope json file for each file it matches. By default it will automatically include any CSS and JS files that it finds in the output and will also minimise the HTML in the your component.

```JavaScript
const StaticComponentEnveloper = require('@bbc/webpack-static-component-enveloper-plugin');

const webpackConfig = {
    ...
    plugins: [
        new StaticComponentEnveloper({
            test: /\.html$/,
            componentName: fileName => fileName.match(/(.*)\.html$/)[1]
        }),
    ]
};
```

This will take each files ending .html and generate a new envelope json file for that component.

## Example

Input: `src/my-new-component.html`

```
Hello World!
```

Output: `dist/my-new-component.json`

```json
{
    "head": [],
    "bodyInline": "Hello World!",
    "bodyLast": ["<script src=\"/js/main.js\"></script>"]
}
```

Notice how the naming of `src/my-new-component.html` is reflected in the outputted envelope name. Also notice how the contents of the html file are placed into the bodyInline section.

If you had multiple .html files then multiple envelopes would be created, they would share the same JS and CSS files in their head and bodyLast sections.

# Configuration
You can pass a hash of configuration options to StaticComponentEveloper. Allowed values are as follows:

**required values marked with \***

| Value | Type | Default | Use |
|-------|------|---------|-----|
| `test`**\*** | `RegExp` or `Function` | - | A regex or function returning a `boolean` to match files to turn into envelopes |
| `componentName`**\*** | `String` or `Function`| - | Explains how to turn a file path matched with the `test` value into a name |
| `hash ` | `Boolean` | `true` | Should a unique hash be appended to assets. Useful for cache-busting |
| `includeCss ` | `Boolean` | `true` |  Should CSS files be automatically included in the head using a `link` tag. |
| `includeJs ` | `Boolean` | `true` |  Should JS files be automatically included in the bodyLast using a `link` tag. |
| `injectHead ` | `String` | `false` | Path to a lodash template which will be inserted into the head element. Useful for injecting core/enhanced css logic |
| `inlineCss ` | `String` | `false` | If set to true the CSS content will be outputted in the head element as style tags |
| `minify ` | `Boolean` | `true` | If the HTML should be minified (uses [html-minifier](https://github.com/kangax/html-minifier)) |


### Injecting a template into the head (`injectHead`)

When pass a valid path to the `injectHead` value that path will be resolved and the file read.

The file is then passed as a template string into [lodash template](https://lodash.com/docs/4.17.4#template) and a compiled output returned.

#### Values available in the lodash template
| Value | Type | Use |
|-------|------|-----|
| `publicPath` | `String` | This the static assets path, it's useful for for including assets from the project in your template |
| `<your_sass_filename>_css` | `String` | The resulting css from the compilation of each of your sass files (e.g. `main_css`) |

#### Example usage of component head
**Input:**

`webpack.config.js`

```JavaScript
const StaticComponentEnveloper = require('@bbc/webpack-static-component-enveloper-plugin');

const webpackConfig = {
    ...
    plugins: [
        new StaticComponentEnveloper({
            test: /\.html$/,
            componentName: fileName => fileName.match(/(.*)\.html$/)[1],
            injectHead: path.resolve(__dirname, 'src/preload-enhanced-css.inc')
        }),
    ]
};
```

`src/preload-enhanced-css.inc`

**Notice the use of the lodash template variable publicPath**

```html
<link rel="preload" as="style" href="<%= publicPath %>enhanced.css">
```

`src/my-new-component.html`

```
Hello World!
```

**Output:**

```json
{
    "head": ["<link rel=\"preload\" as=\"style\" href=\"http://localhost:8080/enhanced.css\">"],
    "bodyInline": "Hello World!",
    "bodyLast": ["<script src=\"/js/main.js\"></script>"]
}
```
