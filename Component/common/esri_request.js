import { LoadModules } from './esri_loader'
import { layersSetting } from '../mapviewer/config'
import {get} from 'lodash'

export const esriRequest = function (url) {
  //  // debugger
  var token = ''

  return LoadModules(['esri/request']).then(([esriRequest]) => {
    var requestHandler = esriRequest({
      'url': url,
      'content': { 'f': 'json', 'token': window.esriToken},
      'callbackParamName': 'callback'
    })

    return requestHandler.then((data) => {
      return data
    }, () => {
      throw 'error'
    })
  })
}
// let mapInfo

export const getMapInfo = function (url) {
  // debugger

  return new Promise((resolve, reject) => {
    let out = {layersSetting}
    esriRequest(url).then(function (mapInfo) {
      // // debugger
      out.info = {}
      out.info.mapInfo = mapInfo
      esriRequest(url + '/legend').then(function (legendInfo) {
        out.info.$legends = legendInfo.layers
        esriRequest(url + '/layers').then(function (layerInfo) {
          out.info.$layers = layerInfo

          out.info.$layers.layers = out.info.$layers.layers.map((layer, key) => {
            if (out.layersSetting[layer.name] && out.layersSetting[layer.name].order)
              layer.viewerOrder = out.layersSetting[layer.name].order
            layer.alias = out.info.$layers.layers[key].name
            return layer
          })

          let visibiles = []
          out.info.$legends = out.info.$legends.map((layer, key) => {
            layer.visible = out.info.$layers.layers[key].defaultVisibility
            if (out.layersSetting[layer.name] && out.layersSetting[layer.layerName].order)
              layer.viewerOrder = out.layersSetting[layer.layerName].order
              // // debugger

            if (layer.visible) {
              visibiles.push(layer.layerId)
            }

            layer.isHidden = out.layersSetting[layer.layerName] && out.layersSetting[layer.layerName].isHidden
            layer.alias = out.info.$layers.layers[key].name
            return layer
          })

          out.mapVisibleLayerIDs = visibiles
          mapInfo = out
          resolve(out)
        })
      })
    })
  })
}
