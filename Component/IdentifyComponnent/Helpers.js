import { element } from "prop-types";
import { loadModules } from 'esri-loader';
import{mapUrl}from"../mapviewer/config/map"

const options = {
    url: 'https://js.arcgis.com/3.29/'
};

export const selectDis=(e)=>{
var a=[];

e.forEach(el => {
    el.features.forEach(element=>{
        if(!a.find((t=>t.attributes.PARCEL_SPATIAL_ID==element.attributes.PARCEL_SPATIAL_ID))){
            a.push(element)
        }
    })
});
return a;
}

export const DataQuery=(layerNum,QueryOptions,CallBack)=>{
    loadModules(["esri/symbols/SimpleLineSymbol","esri/Color","esri/layers/FeatureLayer","esri/tasks/RelationshipQuery","esri/tasks/QueryTask","esri/tasks/query","esri/request","esri/geometry/Polygon","esri/symbols/SimpleFillSymbol","esri/graphic"], options)
    .then(([SimpleLineSymbol,Color,FeatureLayer,RQuery,QueryTask,Query,request,Polygon,SimpleFillSymbol,Graphic]) => {
 
     var query = new Query() 
     var qt = new QueryTask(`http://webgis.eamana.gov.sa/arcgisnew/rest/services/MAPVIEWERSERVICE/MapServer/${layerNum}`)
    QueryOptions.forEach(e=>{
        query[e.name]=e.value
    })
     qt.execute(query,CallBack,(res)=>{console.log(res)})
    })
}
export const queryOption=(where,geo,outfields)=>{
       return [{name:"where",value:where},
       {name:"returnGeometry",value:geo},
       {name:"outFields",value:outfields}
      ]
}
export const querySetting=(num,where,geo,outfields)=>{
    return {
        url:mapUrl+"/"+num,
        where,
        returnGeometry:geo,
        outFields:outfields
}
   
}
export const DataReqest=(url,callBack)=>{
    loadModules(["esri/request"], options)
    .then(([request]) => {
        request({
            url: url,
            content: {f:"json"},
            handleAs: "json",
            callbackParamName:"callback"
        }).then(callBack);
    });
}






