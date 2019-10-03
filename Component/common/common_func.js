import { esriRequest } from './esri_request'
import {mapUrl, geometryServiceUrl} from '../mapviewer/config/map'
import { find } from 'lodash'
import { LoadModules } from './esri_loader'
import {layersSetting} from '../mapviewer/config/layers'
export const getInfo = function(){
  return esriRequest(mapUrl).then((res)=>{
    var temp ={}
    res.layers.forEach(l=> temp[l.name]=l.id)
    return temp
  })
}
// تمسح جرافيك عن طريق الاسم 
export const clearGraphicFromMap = function (map, name) {
  // debugger
  map.graphics.graphics.forEach(function (graphic) {
    if (graphic.attributes) {
      if (graphic.attributes.name == name)
        map.graphics.remove(graphic)
    }
  })
}

export const clearGraphicFromLayer = function (map,name) {
  // debugger
  let graphicLayer = map.getLayer(name)
    graphicLayer.clear()
}

// maping field with domain
export const getFeatureDomainName = function (features, layerId, notReturnCode) {
  // debugger
  return getDomain(layerId, {}).then(function (data) {

    var codedValue = {}
    features.forEach(function (feature) {
      Object.keys(feature.attributes).forEach(function (attr) {
        let result = find(data, { name: attr })
        if (result && result.domain) {
          codedValue = find(result.domain.codedValues, { 'code': feature.attributes[attr]})
          if(!codedValue)
          {
            if (!isNaN(feature.attributes[attr])){
              codedValue = find(result.domain.codedValues, {
                'code': +feature.attributes[attr]
              })
            }
          }
          if (codedValue && codedValue.name) {
            if (!notReturnCode)
              feature.attributes[attr + '_Code'] = feature.attributes[attr]
            feature.attributes[attr] = codedValue.name
          }
        }
      })
    })
    return features
  }, function (error) {
    return
  })
}

export const queryTask = function (settings) {
  // url, where, outFields, callbackResult,statistics[], callbackError, preQuery, returnGeometry) {
  LoadModules(['esri/tasks/query' , 'esri/tasks/StatisticDefinition', 'esri/tasks/QueryTask'])
    .then(([Query, StatisticDefinition, QueryTask]) => {

      // debugger
      var query = new Query()
      query.returnGeometry = settings.returnGeometry || false
      if (settings.geometry)
      query.geometry = window.dojo.clone(settings.geometry)

      // Zero-based index indicating where to begin retrieving features.
      // query.start = settings.start

      // Number of features to retrieve.
      // query.num = 10
      query.returnIdsOnly = settings.returnIdsOnly || false
      //query.returnCountOnly = settings.returnCountOnly || false
      query.outFields = settings.outFields || ['*']
      query.returnDistinctValues = settings.returnDistinctValues || false

      if(query.returnDistinctValues)
      {
        query.returnGeometry = false;
      }

      if (settings.statistics) {
        query.outStatistics = []
        var statisticDefinition = {}
        settings.statistics.forEach(function (val) {
          statisticDefinition = new StatisticDefinition()
          statisticDefinition.statisticType = val.type
          statisticDefinition.onStatisticField = val.field
          statisticDefinition.outStatisticFieldName = val.name
          query.outStatistics.push(statisticDefinition)
        })
      }

      query.groupByFieldsForStatistics = settings.groupByFields
      // query.returnCountOnly = settings.returnCountOnly || false
      if (settings.preQuery) {
        settings.preQuery(query, Query)
      }

      if(settings.orderByFields){
        query.orderByFields = settings.orderByFields
      }

      if (settings.queryWithGemoerty) {
        query.geometry = settings.geometry
        query.distance = 5
      }
      else
        query.where = settings.where || '1=1'

      var token = ''//'?token='+ window.esriToken
      // var hasPermission = $rootScope.getPermissions('splitandmerge.MAPEXPLORER', 'modules.INVESTMENTLAYERS')
      // if (hasPermission) {
      // token = '?token=' + $rootScope.User.esriToken
      // }

      var queryTask = new QueryTask((settings.url+token)); // + "?token=" + $rootScope.User.esriToken + "&username='d'")

      function callback (data) {

      settings.callbackResult(data)
      }

      function callbError (data) {
        //window.notifySystem('warning', 'حدث خطأ اثناء استرجاع البيانات')

        if (settings.callbackError) {
          settings.callbackError(data)
        }
      }

      if(settings.returnCountOnly)
      {
        queryTask.executeForCount(query, callback, callbError)
      }
      else{
        queryTask.execute(query, callback, callbError)
      }

    })
}
export const getStatistics = function (attribute, layerIndex) {

  return new Promise((resolve, reject) => {
    LoadModules(['esri/tasks/query', 'esri/tasks/StatisticDefinition', 'esri/tasks/QueryTask']).then(([Query, StatisticDefinition, QueryTask]) => {
      var sqlExpression = "1";

      var url = `${mapUrl}/${layerIndex}`;
      var sd = new StatisticDefinition();
      sd.statisticType = "count";
      sd.onStatisticField = sqlExpression;
      sd.outStatisticFieldName = "Count";

      var queryParams = new Query();
      queryParams.outFields = [attribute];
      queryParams.outStatistics = [sd];
      queryParams.groupByFieldsForStatistics = [attribute];
      var queryTask = new QueryTask(url);
      queryTask.execute(queryParams).then((r) => {
        getFeatureDomainName(r.features, layerIndex).then((res)=>{
          resolve(res);
        })
      })
    })
  });
}
export const getInvestStatisticsBySiteActivity = () => {

  return getStatistics('SITE_ACTIVITY', 4).then((d)=>(d.map(v=>v.attributes)));
}
export const getInvestStatisticsBySiteStatus = () => {
  return getStatistics("SITE_STATUS", 5).then((d) => (d.map(v=>v.attributes)));
}
window.mapViewer ={}
// fieldName ,code for subtypes
export const getDomain = function (layerId, settings) {
  return new Promise((resolve, reject) => {
    let serv = window.mapViewer
    let loadings = []
    var returnedDomain

    if (serv.Domains && serv.Domains[layerId]) {
      const domain = serv.Domains[layerId]
      if (!settings.fieldName && !settings.code) {
        domain.fields.forEach(function (val) {
          if (!val.domain) {
            settings.fieldName = val.name
            settings.isSubType = true
            if (domain.types) {
              returnedDomain = getSubTypes(domain, settings)

              if (returnedDomain) {
                if (settings.isfilterOpened)
                  val.domain = returnedDomain
                else
                  val.domain = { codedValues: returnedDomain }
              }
              else
                val.domain = null
            }
          }
        })
        returnedDomain = domain.fields
      } else if (settings.isSubType && settings.fieldName) {
        returnedDomain = getSubTypes(domain, settings)
      } else {
        domain.fields.forEach(function (field) {
          if (field.name == settings.fieldName && field.domain) {
            returnedDomain = field.domain.codedValues
          }
        })
      }
    }

    if (returnedDomain) {
      resolve(returnedDomain)
      return
    } else {
      var url = mapUrl + '/' + layerId
      if (loadings.indexOf(url) == -1) {
        loadings.push(url)
        esriRequest(url).then((res) => {
          // debugger
          serv.Domains = serv.Domains || []
          window.mapViewer.Domains[layerId] = {
            fields: res.fields,
            types: res.types
          }
          loadings.pop(url)
          getDomain(layerId, settings).then((data) => {
            resolve(data)
            return
          }, function () {})
        }, function () {
          loadings.pop(url)
        })
      } else {
        return reject()
      }
    }
  })
}

export const getSubTypes = function (domain, settings) {
  var returnedDomain = []
  if (domain.types) {
    domain.types.forEach(function (subType) {
      if (settings.isSubType && !settings.code) {
        if (!returnedDomain)
          returnedDomain = []

        if (subType.domains[settings.fieldName]) {
          if (settings.isfilterOpened)
            returnedDomain.push({id: subType.id, name: subType.name, isSubType: true})
          else
            returnedDomain.push.apply(returnedDomain, subType.domains[settings.fieldName].codedValues)
        }
      } else {
        if (subType.id == settings.code && subType.domains[settings.fieldName]) {
          returnedDomain = subType.domains[settings.fieldName].codedValues
        }
      }
    })
  }

  return returnedDomain.length == 0
    ? null
    : returnedDomain
}
//Reproject features
export const project = function (features, outSR, callback) {
  if (features) {
    var isSameWkid = false
    if (features.length) {
      if (features[0].spatialReference.wkid == outSR) {
        isSameWkid = true
        callback([features])
      }
    } else {
      if (features.spatialReference && features.spatialReference.wkid == outSR) {
        isSameWkid = true
        callback([features])
      }
    }

    if (!isSameWkid) {
      LoadModules(['esri/tasks/ProjectParameters']).then(([ProjectParameters]) => {
        outSR = new window.esri.SpatialReference({
          wkid: outSR
        })

        var gemoertyService = window.esri.tasks.GeometryService(geometryServiceUrl)

        var params = new ProjectParameters()

        if (features.length)
          params.geometries = features
        else
          params.geometries = [features]

        params.outSR = outSR
        gemoertyService.project(params, callback)
      }, function (error) {
        // debugger
      })
    }else {
      callback(null)
    }
  }
}

export const queryOnInvestLayers = function (where, layers, layersName) {
  let count = layers.length
  var result = {}


  return new Promise((resolve, reject) => {

    layers.forEach((layer, key) => {

      queryTask({
        url: mapUrl + '/' + layer,
        where: where.join(' and '),
        outFields: layersSetting[layersName[key]].outFields,
        callbackResult: (data) => {
          count--

          if (!result.features)
            result = data
          else
            result
              .features
              .push
              .apply(result.features, data.features)

          if (count == 0) {
            resolve(result)
          }
        },
        returnGeometry: true,
        callbackError(error) {}

      })
    })
  })
}



export const highlightFeature = function (feature, map, settings) {
  //noclear, layerName, isZoom, fillColor, strokeColor, isDashStyle, isHighlighPolygonBorder, callback, highlightWidth,zoomFactor) {
   
  if (feature) {

    if(!settings.isSavePreviosZoom)
      window.extent = undefined;

     window.identify = false;
    LoadModules([
      'esri/geometry/Point',
      'esri/geometry/Polyline', 
      'esri/geometry/Polygon',
      'esri/graphic',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/PictureMarkerSymbol']).then(([Point, Polyline, Polygon, Graphic, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, PictureMarkerSymbol]) => {

      let symbol


console.log(settings,map)

      let graphicLayer = map.getLayer(settings.layerName)
      
      //
      
      if (!settings.noclear)
        graphicLayer.clear()

      // let highlightWidth = settings.highlightWidth || 3
      let fillColor = settings.fillColor || 'black'
      let strokeColor = settings.strokeColor || 'black'
      let highlighColor = settings.highlighColor || [0, 255, 255];
      let Color = window.dojo.Color

      function highlightGeometry (feature) {
        if (feature.geometry) {
          if (feature.geometry.type == 'polygon') {
            feature.geometry = new Polygon(feature.geometry)
            if (settings.isGetCenter) {
              feature.geometry = feature.geometry.getExtent().getCenter()
            }
          }
          else if (feature.geometry.type == 'point') {
            feature.geometry = new Point(feature.geometry)
          }

          var graphic

          if (feature.geometry.type === 'point') {
            if (settings.isHiglightSymbol) {
              strokeColor = highlighColor
              fillColor = settings.fillColor ||  highlighColor
            }

            //settings.zoomFactor = 50
            symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 28, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(strokeColor), 2),
              new Color([0, 0, 0, 0.2]))

            if (settings.isInvest) {
              symbol = new PictureMarkerSymbol({'angle': 0,'xoffset': 0,'yoffset': 0,'type': 'esriPMS','url': './images/noty.svg','contentType': 'image/png',
              'width': 40,'height': 40})
            }
             else if (settings.isInvestPoint) {
               symbol = new PictureMarkerSymbol({
                 'angle': 0,
                 'xoffset': 0,
                 'yoffset': 0,
                 'type': 'esriPMS',
                 'url': './images/invest_point.svg',
                 'contentType': 'image/png',
                 'width': 40,
                 'height': 40
               })
             }
            else if (settings.isLocation) {
              console.log('1')
              symbol = new PictureMarkerSymbol({'angle': 0,'xoffset': 0,'yoffset': 0,'type': 'esriPMS','url': './images/marker2.png',
              'contentType': 'image/png','width': 40,'height': 40})
            }
          } else {
            symbol = GetSymbol(settings, settings.fillColor || fillColor, strokeColor, SimpleFillSymbol, SimpleLineSymbol, PictureMarkerSymbol)
          }
          graphic = new Graphic(feature.geometry, symbol, settings.attr)
        } else {

          if (feature.type === 'point') {
            if (settings.isHiglightSymbol) {
              strokeColor = highlighColor
              fillColor = settings.fillColor || highlighColor
            }
            settings.zoomFactor = 50
            symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 28, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(strokeColor), 2), new Color(fillColor))

            if (settings.isLocation) {
              console.log('2')
              symbol = new PictureMarkerSymbol({'angle': 0,'xoffset': 0,'yoffset': 0,'type': 'esriPMS','url': './images/marker2.png','contentType': 'image/png','width': 40,'height': 40})
            }
          } else if (feature.type === 'polyline') {
            symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(fillColor), 7)
          } else {
            symbol = GetSymbol(settings, settings.fillColor || fillColor, strokeColor, SimpleFillSymbol, SimpleLineSymbol, PictureMarkerSymbol)
          }
          graphic = new Graphic(feature, symbol, settings.attr, null)
        }
        graphicLayer.add(graphic)

        if (!settings.listOfFeatures && settings.isZoom) {
          if (!feature.length) {
            zoomToFeature([feature], map, settings.zoomFactor || 300, settings.callback)
          } else {
            zoomToFeature(feature, map, settings.zoomFactor || 300, settings.callback)
          }
        }

        graphicLayer.redraw()
      }
      // debugger
      if (feature && !feature.length) {
        if (feature.geometry || feature.type) {
          highlightGeometry(feature)
        }
      } else {
        if (feature && feature[0] && feature[0].geometry && feature[0].geometry.type === 'point') {
          if (settings.isHiglightSymbol) {
            strokeColor = highlighColor
            fillColor = settings.fillColor || highlighColor
          }
          settings.zoomFactor = 50
          symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(strokeColor), 2), new Color(fillColor))
        }else {
          symbol = GetSymbol(settings, settings.fillColor || fillColor, strokeColor, SimpleFillSymbol, SimpleLineSymbol, PictureMarkerSymbol)
        }

        feature.forEach(function (elem) {
          if (elem.geometry) {
            if (elem.geometry.type == 'polygon') {
              elem.geometry = new Polygon(elem.geometry)
              if (settings.isGetCenter) {
                elem.geometry = elem.geometry.getExtent().getCenter()
              }
            }

            if (settings.isInvest) {
              symbol = new PictureMarkerSymbol({'angle': 0,'xoffset': 0,'yoffset': 0,'type': 'esriPMS','url': './images/noty.svg','contentType': 'image/png','width': 40,'height': 40})
            }
            else if (settings.isInvestPoint) {
              symbol = new PictureMarkerSymbol({
                'angle': 0,
                'xoffset': 0,
                'yoffset': 0,
                'type': 'esriPMS',
                'url': './images/invest_point.svg',
                'contentType': 'image/png',
                'width': 40,
                'height': 40
              })
            }
            else if (settings.isLocation) {
              symbol = new PictureMarkerSymbol({'angle': 0,'xoffset': 0,'yoffset': 0,'type': 'esriPMS','url': './images/marker2.png','contentType': 'image/png','width': 40,'height': 40})
            }

            var graphic = new Graphic(elem.geometry, symbol, settings.attr, null)
            graphicLayer.add(graphic)
          }
          else if (elem.type == 'point') {
            if (settings.isInvest) {
              symbol = new PictureMarkerSymbol({'angle': 0,'xoffset': 0,'yoffset': 0,'type': 'esriPMS','url': './images/noty.svg','contentType': 'image/png','width': 40,'height': 40})
            }
             else if (settings.isInvestPoint) {
               symbol = new PictureMarkerSymbol({
                 'angle': 0,
                 'xoffset': 0,
                 'yoffset': 0,
                 'type': 'esriPMS',
                 'url': './images/invest_point.svg',
                 'contentType': 'image/png',
                 'width': 40,
                 'height': 40
               })
             }
            else if (settings.isLocation) {
              symbol = new PictureMarkerSymbol({'angle': 0,'xoffset': 0,'yoffset': 0,'type': 'esriPMS','url': './images/marker2.png','contentType': 'image/png','width': 40,'height': 40})
            }

             graphic = new Graphic(elem, symbol, settings.attr, null)
            graphicLayer.add(graphic)
          }
        })

        if (settings.isZoom) {
          if (!feature.length) {
            zoomToFeature([feature], map, settings.zoomFactor || 150, settings.callback)
          } else {
            zoomToFeature(feature, map, settings.zoomFactor || 150, settings.callback)
          }
        }
        graphicLayer.redraw()
      }
    })
  }
}

export const GetSymbol = function (settings, fillColor, strokeColor, SimpleFillSymbol, SimpleLineSymbol, PictureMarkerSymbol) {
  // debugger
  let symbol
  let Color = window.dojo.Color
  let highlightWidth = settings.highlightWidth || 3
  let highlighColor = settings.highlighColor || [0, 255, 255];
  if (settings.isLocation) {
    symbol = new PictureMarkerSymbol({
      'angle': 0,
      'xoffset': 0,
      'yoffset': 0,
      'type': 'esriPMS',
      'url': './images/marker2.png',
      'contentType': 'image/png',
      'width': 40,
      'height': 40
    })
  }
  else if (settings.isHiglightSymbol)
    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleFillSymbol.STYLE_SOLID, new Color(highlighColor), highlightWidth),
      new Color(highlighColor))
  else if (settings.isDashStyle)
    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_BACKWARD_DIAGONAL, new SimpleLineSymbol(SimpleFillSymbol.STYLE_SOLID, new Color(strokeColor), highlightWidth), new Color(fillColor))
  else if (settings.isHighlighPolygonBorder)
    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL, new SimpleLineSymbol(SimpleFillSymbol.STYLE_SOLID, new Color(strokeColor), highlightWidth), new Color(fillColor))
  else
    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL, new SimpleLineSymbol(SimpleFillSymbol.STYLE_SOLID, new Color(strokeColor), highlightWidth), new Color(fillColor))
  return symbol
}

export const zoomToLayer = function (layerName, map, factor) {
  zoomToFeature(map.getLayer(layerName).graphics, map, factor || 2)
}

export const zoomToFeature = function (feature, map, zoomFactor, callback) {
  LoadModules([
    'esri/geometry/Point',
    'esri/geometry/Polyline',
    'esri/geometry/Polygon',
    'esri/graphic',
    'esri/graphicsUtils',
    'esri/geometry/Extent'
  ]).then(([Point, Polyline, Polygon, Graphic, graphicsUtils, Extent]) => {
    // debugger
    var myFeatureExtent
    //
    try {
      myFeatureExtent = graphicsUtils.graphicsExtent(feature)
    } catch (e) {
      if (feature.length) {
        feature.forEach(function (f) {
          if (f.geometry) {
            if (f.geometry.type == 'polygon') {
              if (!f.geometry.spatialReference)
                f.geometry.spatialReference = { 'wkid': map.spatialReference.wkid }
              f.geometry = new Polygon(f.geometry)
            }
          } else if (f.type) {
            if (f.type == 'point') {
              f.geometry = new Point(f)
            }
          }
        })
      } else {
        if (feature.geometry.type == 'polygon') {
          feature.geometry = new Polygon(feature.geometry)
        }
        feature = [feature]
      }
      try {
        myFeatureExtent = graphicsUtils.graphicsExtent(feature)
      } catch (e) {
        // $rootScope.$apply()
      }
    }

    if (!feature.length) {
      if (feature.geometry.type == 'point') {
        let extent = new Extent(myFeatureExtent.xmin - zoomFactor, myFeatureExtent.ymin - zoomFactor, myFeatureExtent.xmax + zoomFactor, myFeatureExtent.ymax + zoomFactor, map.spatialReference)

        map.setExtent(extent.expand(5)).then(callback)
      } else {
        if (zoomFactor) {
          myFeatureExtent.xmin = myFeatureExtent.xmin - zoomFactor
          myFeatureExtent.ymin = myFeatureExtent.ymin - zoomFactor
          myFeatureExtent.xmax = myFeatureExtent.xmax + zoomFactor
          myFeatureExtent.ymax = myFeatureExtent.ymax + zoomFactor
        }

        map.setExtent(myFeatureExtent).then(callback)
      }
    } else {
      if (feature[0].geometry) {
        if (feature[0].geometry.type == 'point') {
          var extent = new Extent(myFeatureExtent.xmin - zoomFactor, myFeatureExtent.ymin - zoomFactor, myFeatureExtent.xmax + zoomFactor, myFeatureExtent.ymax + zoomFactor, map.spatialReference)

          map.setExtent(extent.expand(5)).then(callback)
        } else {
          if (zoomFactor) {
            myFeatureExtent.xmin = myFeatureExtent.xmin - zoomFactor
            myFeatureExtent.ymin = myFeatureExtent.ymin - zoomFactor
            myFeatureExtent.xmax = myFeatureExtent.xmax + zoomFactor
            myFeatureExtent.ymax = myFeatureExtent.ymax + zoomFactor
          }

          map.setExtent(myFeatureExtent).then(callback)
        }
      } else if (feature[0].type == 'point') {
         extent = new Extent(myFeatureExtent.xmin - zoomFactor, myFeatureExtent.ymin - zoomFactor, myFeatureExtent.xmax + zoomFactor, myFeatureExtent.ymax + zoomFactor, map.spatialReference)

        map.setExtent(extent.expand(5)).then(callback)
      } else {
        if (zoomFactor) {
          myFeatureExtent.xmin = myFeatureExtent.xmin - zoomFactor
          myFeatureExtent.ymin = myFeatureExtent.ymin - zoomFactor
          myFeatureExtent.xmax = myFeatureExtent.xmax + zoomFactor
          myFeatureExtent.ymax = myFeatureExtent.ymax + zoomFactor
        }

        map.setExtent(myFeatureExtent).then(callback)
      }
    }
  })
}
