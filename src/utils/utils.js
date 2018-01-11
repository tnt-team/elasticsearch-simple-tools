'use strict'
import $ from 'jquery'

var indices = null

export default {
  getHost () {
    let protocol = window.location.protocol
    let hostname = window.location.hostname
    let port = window.location.port
    return protocol + '//' + hostname + (port === '80' ? '' : ':9200')
  },
  fetchState () {
    return new Promise((resolve, reject) => {
      if (indices) {
        resolve(indices)
        return
      }

      let url = this.getHost() + '/_cluster/state'

      $.ajax({
        type: 'GET',
        url: url,
        success (data) {
          if (typeof data.metadata !== 'object') {
            console.error('fetchState error: data not correct!')
            reject(new Error('fetchState error: data not correct!'))
            return
          }
          // console.log(data);
          indices = {}
          let dataIndices = data.metadata.indices
          Object.keys(dataIndices).forEach(index => {
            let indexData = dataIndices[index]
            let indexMappings = indexData.mappings

            indices[index] = Object.keys(indexMappings)
          })
          console.log(indices)
          resolve(indices)
        },
        error (err) {
          console.error('fetchState error: ', err)
          reject(err)
        }
      })
    })
  },
  getState () {
    return indices
  },
  formatJson (json, options) {
    let reg = null
    let formatted = ''
    let pad = 0
    let PADDING = ''
    // one can also use '\t' or a different number of spaces
    // optional settings
    options = options || {}
    // remove newline where '{' or '[' follows ':'
    options.newlineAfterColonIfBeforeBraceOrBracket = options.newlineAfterColonIfBeforeBraceOrBracket === true
    // use a space after a colon
    options.spaceAfterColon = options.spaceAfterColon === false
    // begin formatting...
    if (typeof json !== 'string') {
      // make sure we start with the JSON as a string
      json = JSON.stringify(json)
    } else {
      // is already a string, so parse and re-stringify
      // in order to remove extra whitespace
      json = JSON.parse(json)
      json = JSON.stringify(json)
    }
    // add newline before and after curly braces
    reg = /([{}])/g
    json = json.replace(reg, '\r\n$1\r\n')
    // add newline before and after square brackets
    reg = /([[]])/g
    json = json.replace(reg, '\r\n$1\r\n')
    // add newline after comma
    reg = /(,)/g
    json = json.replace(reg, '$1\r\n')
    // remove multiple newlines
    reg = /(\r\n\r\n)/g
    json = json.replace(reg, '\r\n')
    // remove newlines before commas
    reg = /\r\n,/g
    json = json.replace(reg, ',')
    // optional formatting...
    if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
      reg = /:\r\n\{/g
      json = json.replace(reg, ':{')
      reg = /:\r\n\[/g
      json = json.replace(reg, ':[')
    }
    if (options.spaceAfterColon) {
      reg = /:/g
      json = json.replace(reg, ': ')
    }
    $.each(json.split('\r\n'), (index, node) => {
      let i = 0
      let indent = 0
      let padding = ''
      if (node.match(/\{$/) || node.match(/\[$/)) {
        indent = 1
      } else if (node.match(/\}/) || node.match(/\]/)) {
        if (pad !== 0) {
          pad -= 1
        }
      } else {
        indent = 0
      }
      for (i = 0; i < pad; i++) {
        padding += PADDING
      }
      formatted += padding + node + '\r\n'
      pad += indent
    })
    return formatted
  },
  downloadFile (fileName, content, ext) {
    let a = document.createElement('a')
    let defaultType = {
      type: 'application/json'
    }
    if (ext) defaultType.type = ext
    let blob = new Blob([content], {
      type: defaultType
    })
    let url = window.URL.createObjectURL(blob)
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
  }
}
