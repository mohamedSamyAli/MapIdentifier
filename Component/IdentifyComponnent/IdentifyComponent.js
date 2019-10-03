import React, { Component } from 'react'
import{LoadModules} from'../common/esri_loader'
import { esriRequest } from '../common/esri_request'
import { queryTask , getInfo,highlightFeature ,clearGraphicFromLayer,getFeatureDomainName} from '../common/common_func'
import{mapUrl}from"../mapviewer/config/map"
import { Select , Button , Spin} from 'antd';
import 'antd/dist/antd.css';
import MapComponent from"../MapComponent/MapComponent"
import{connect}from "react-redux"
import LandTable from'../LandTable/LandTable'
import{querySetting,selectDis}from'./Helpers'
var uniqid = require('uniqid');
const { Option } = Select;

 class IdentifyComponent extends Component {
     constructor(){
       super()
       debugger
this.tt = {a:1,b:2,c:3}
var k  ={...this.tt}
var m = {...{...this.tt}}
var m = {}

         this.PlanNum=[];
         this.parcelTs=[];
         this.selectionMode=false;
         console.log(this.props)
         this.state={
             munval:undefined,
             planeval:undefined,
             subTypeval:undefined,
             subNameval:undefined,
             blockval:undefined,
             parcelval:undefined,
             spinning:false,
             planId:null,
             blockNum:[],
             planSersh:null,
             subDivNames:[],
             subDivType:[],
             parcelNum:[],
             parcelNumS:[],
             MunicipalityNames:[],
             PlanNum:[],
             parcelId:null,
             mapExtend:null,
             parcelSearch:null,
             poly:null
            }
     }
     LayerID= [];
    componentDidMount(){
      this.props.setSParcel(this.DrawGraph)
        LoadModules([
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color"
        ,"esri/layers/FeatureLayer"
        ,"esri/tasks/RelationshipQuery"
        ,"esri/tasks/QueryTask",
        "esri/tasks/query"
        ,"esri/geometry/Polygon"
        ,"esri/symbols/SimpleFillSymbol"
        ,"esri/graphic"])
        .then(([GraphicsLayer,SimpleLineSymbol,Color,FeatureLayer,RQuery,QueryTask,Query,Polygon,SimpleFillSymbol,Graphic]) => {
         this.SelectGraphicLayer = new GraphicsLayer()
         this.Polygon=Polygon;   
         this.QueryTask = QueryTask;
         this.Query= new Query();
         this.QueryOb=Query;
         this.RQuery=RQuery;
         this.graphic = Graphic;
         this.SimpleFillSymbol = new SimpleFillSymbol();
         this.heighLightSymbol =new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
          new Color([255,0,0]), 2),new Color([255,255,0,0.25]))
          this.SheighLightSymbol =new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
            new Color([0,255,0]), 2),new Color([255,0,255,0.25]))
         this.FeatureLayer=FeatureLayer;
        });  
        getInfo().then((res)=>{
          this.LayerID = res;
          esriRequest(mapUrl+"/"+this.LayerID.Municipality_Boundary).then((response) =>{
            console.log(response)
            this.setState( { MunicipalityNames: response.types[0].domains.MUNICIPALITY_NAME.codedValues}) 
          })
        })   
     }
     onMunChange= (e)=>{
      clearGraphicFromLayer(this.props.map,"SelectLandsGraphicLayer")
       this.props.restSelect()
      this.setState({
        munval:e,
        planeval:undefined,
        subTypeval:undefined,
        subNameval:undefined,
        blockval:undefined,
        parcelval:undefined,
        PlanNum:[],
        planId:null,
        blockNum:[],
        subDivNames:[],
        subDivType:[],
        parcelId:null,
        parcelNum:[],
        spinning:true
       })
var count=0
if(count===1){
  this.setState({spinning:false})
}else{count++}    
queryTask({
  ...querySetting(15,`MUNICIPALITY_NAME="${e}"`,true,["MUNICIPALITY_NAME"]),
  callbackResult:(res)=>{
    
    this.pol=res.features[0]
    highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})

    if(count===1){
      this.setState({spinning:false})
    }else{count++}
  }
})
queryTask({
  ...querySetting(this.LayerID.Plan_Data,`MUNICIPALITY_NAME="${e}"`,false,["PLAN_SPATIAL_ID","PLAN_NO"]),
  callbackResult:(res)=>{
    this.setState( { PlanNum: res.features.map((e,i)=>{return{...e,i:uniqid()}})})
     
    if(count===1){
    this.setState({spinning:false})
    }else{count++}
    }
})
 }

    onPlaneChange = (f)=>{
      clearGraphicFromLayer(this.props.map,"SelectLandsGraphicLayer")
      this.props.restSelect()
      var e=this.state.PlanNum.filter(m=>m.i==f)[0].attributes.PLAN_SPATIAL_ID
      this.setState({
        planeval:f,
        subTypeval:undefined,
        subNameval:undefined,
        blockval:undefined,
        parcelval:undefined,
        blockNum:[],
        subDivNames:[],
        subDivType:[],
        parcelId:null,
        parcelNum:[],
        spinning:true
      })
      var count=0;
      queryTask({
        ...querySetting(this.LayerID.Plan_Data,`PLAN_SPATIAL_ID="${e}"`,true,["MUNICIPALITY_NAME"]),
        callbackResult:(res)=>{
    this.pol=res.features[0]
    highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})
          this.setState({planId:e}) 
          if(count==2){
            this.setState({spinning:false})
          }else{count++} 
        }})
      queryTask({
        ...querySetting(this.LayerID.Survey_Block,`PLAN_SPATIAL_ID="${e}"`,false,["BLOCK_NO","BLOCK_SPATIAL_ID"]),
        callbackResult:(res)=>{  
          this.setState({blockNum:res.features})
           if(count==2){
             this.setState({spinning:false})
           }else{count++} 
          }})
    queryTask({
      ...querySetting(this.LayerID.Landbase_Parcel,`PLAN_SPATIAL_ID="${e}"`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"]),
      callbackResult:(res)=>{
        this.setState({parcelSearch:null,parcelNum:res.features.map((e,i)=>{return{...e,i}})})
        if(count==2){
         this.setState({spinning:false})
       }else{count++}   
      }})
      esriRequest(mapUrl+"/"+this.LayerID.Subdivision).then(response=>{
        this.setState( { subDivType: response.fields[7].domain.codedValues})
      })
    }
    onSubTypeChange=(e)=>{      
      clearGraphicFromLayer(this.props.map,"SelectLandsGraphicLayer")
      this.setState({
        subTypeval:e,
        subNameval:undefined,
        blockval:undefined,
        parcelval:undefined,
        spinning:true})

      queryTask({
        ...querySetting(this.LayerID.Subdivision,`SUBDIVISION_TYPE=${e} AND PLAN_SPATIAL_ID=${this.state.planId}`,false,["SUBDIVISION_DESCRIPTION","SUBDIVISION_SPATIAL_ID"]),
        callbackResult:(res)=>{
          this.setState({subDivNames:res.features,spinning:false})   
        }})    
      }
      onSubNameChange=(e)=>{
        clearGraphicFromLayer(this.props.map,"SelectLandsGraphicLayer")
        this.setState({
          subNameval:e,
          blockval:undefined,
          parcelval:undefined,
          parcelNum:[],
          parcelId:null,
          spinning:true
        })
        var count =0;
        debugger
        queryTask({
          ...querySetting(this.LayerID.Subdivision,`SUBDIVISION_SPATIAL_ID=${e}`,true,["SUBDIVISION_SPATIAL_ID"]),
          callbackResult:(res)=>{
            //this.setState({subDivNames:res.features,spinning:false})   
            this.pol=res.features[0]  
            highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})
   
            if(count==1){
              this.setState({spinning:false})
            }else{count++} 
          }})
        queryTask({
          ...querySetting(this.LayerID.Landbase_Parcel,`SUBDIVISION_SPATIAL_ID=${e}`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"]),
          callbackResult:(res)=>{
            this.setState({parcelSearch:null,parcelNum:res.features.map((e,i)=>{return{...e,i}})})
            if(count==1){
              this.setState({spinning:false})
}else{count++} 
}})

}

onBlockChange=(e)=>{
  clearGraphicFromLayer(this.props.map,"SelectLandsGraphicLayer")
  this.setState({
    blockval:e,
    parcelval:undefined,
    parcelId:null,
    parcelNum:[],
    spinning:true
  })
  var count =0;
  
  queryTask({
    ...querySetting(this.LayerID.Survey_Block,`BLOCK_SPATIAL_ID=${e}`,true,["BLOCK_SPATIAL_ID"]),
    callbackResult:(res)=>{
    this.pol=res.features[0]     
      highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})
      if(count===1){
        this.setState({spinning:false})
      }else{count++} 
    }})

  queryTask({
    ...querySetting(this.LayerID.Landbase_Parcel,`BLOCK_SPATIAL_ID=${e}`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"]),
    callbackResult:(res)=>{
      this.setState({parcelSearch:null,parcelNum:res.features.map((e,i)=>{return{...e,i}})})
      if(count==1){
        this.setState({spinning:false})
      }else{count++} 
    }}) 
  }
  
  onLandParcelChange=(f)=>{
   
    console.log(f,this.state.parcelNum)
    if(!this.props.selectedLands.length){
      var e=this.state.parcelNum.filter(m=>m.i===f)[0].attributes.PARCEL_SPATIAL_ID
      this.setState({spinning:true,parcelId:e,parcelval:f})
    this.RolBackPol = this.pol
    this.RolBackParcelNum = this.state.parcelNum
    queryTask({
      ...querySetting(this.LayerID.Landbase_Parcel,`PARCEL_SPATIAL_ID="${e}"`,true,["PARCEL_SPATIAL_ID"]),
      callbackResult:(res)=>{
      // highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.7],zoomFactor:50})
      highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",strokeColor:[255,255,0],isHighlighPolygonBorder:true,highlightWidth:8,isZoom:true,zoomFactor:50})
      this.setState({spinning:false})
      }})
    }else{
      debugger
      var g=this.state.parcelNum.filter(m=>m.i==f)[0]
      this.setState({spinning:true,parcelId:g.attributes.PARCEL_SPATIAL_ID}) 
      highlightFeature(g,this.props.map,{layerName:"SelectGraphicLayer",strokeColor:[255,255,0],isHighlighPolygonBorder:true,highlightWidth:8})
      this.setState({spinning:false,parcelval:f})    
    }

      


  

      }
  
  addParcelToSelect= ()=>{
    this.setState({spinning:true})
    this.setState({parcelId:this.props.selectedLands[this.props.selectedLands.length-1].id})
    var qt = new this.QueryTask(mapUrl+"/"+this.LayerID.Landbase_Parcel)
    const quer = new this.QueryOb()
    var temp = new this.Polygon(this.props.selectedLands[this.props.selectedLands.length-1].geo)
    quer.geometry=temp
    //quer.geometry=this.poll
    quer.outFields = ["SHAPE.AREA","PARCEL_PLAN_NO","PARCEL_SPATIAL_ID"];
    quer.distance=1
  quer.returnGeometry=true
  quer.spatialRelationship =  this.QueryOb.SPATIAL_REL_INTERSECTS;
  qt.execute(quer,(res)=>{

    console.log(res)

    res.features= res.features.map((e,i)=>{return{...e,i:uniqid()}})
   // getFeatureDomainName(res.features,this.LayerID.Landbase_Parcel).then(()=>{this.props.selectedLandsT.push(res)})
    this.props.selectedLandsT.push(res)
    this.DrawGraph();
      this.setState({spinning:false})
      },(res)=>{console.log(res)})
}
DrawGraph=()=>{
   
  if(!this.props.selectedLands.length){
    this.props.map.graphics.clear();
    clearGraphicFromLayer(this.props.map,"SelectLandsGraphicLayer")
   // highlightFeature(this.RolBackPol,this.props.map,{layerName:"SelectGraphicLayer",strokeColor:[255,255,0],isHighlighPolygonBorder:true,highlightWidth:8,noclear:false,isZoom:false,})
  console.log(">>>>>>>>>>>>>>>>>>>>",this.RolBackPol)
   highlightFeature(this.RolBackPol,this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})

   // this.props.map.graphics.add(new this.graphic(this.RolBackPol,this.SimpleFillSymbol))
   // this.props.map.setExtent(this.RolBackPol.getExtent())
    this.setState({parcelSearch:null,parcelNum:this.RolBackParcelNum,parcelval:undefined})
  }
  else{
    this.parcelDis = selectDis(this.props.selectedLandsT)
    this.setState({parcelSearch:null,parcelNum:this.parcelDis})
    clearGraphicFromLayer(this.props.map,"SelectLandsGraphicLayer")
    clearGraphicFromLayer(this.props.map,"SelectGraphicLayer")
    // if(element.attributes.PARCEL_SPATIAL_ID===this.props.selectedLands[this.props.selectedLands.length-1].id)
    highlightFeature(this.parcelDis.filter(element=>!this.props.selectedLands.find(i=>i.id===element.attributes.PARCEL_SPATIAL_ID)),this.props.map,{layerName:"SelectLandsGraphicLayer",noclear:false,isZoom:false,isHiglightSymbol:true,highlighColor:[0,0,255,.50],zoomFactor:50})    
    highlightFeature(this.parcelDis.filter(element=>this.props.selectedLands.find(i=>i.id===element.attributes.PARCEL_SPATIAL_ID)),this.props.map,{layerName:"SelectLandsGraphicLayer",noclear:true,isZoom:true,isHiglightSymbol:true,highlighColor:[0,255,0,.50],zoomFactor:50})    
    
    this.parcelDis.forEach(element => { 



    //   if(this.props.selectedLands.find(i=>i.id===element.attributes.PARCEL_SPATIAL_ID))
    //   {
    // // highlightFeature(element,this.props.map,{layerName:"SelectLandsGraphicLayer",noclear:true,isZoom:true,isHiglightSymbol:true,highlighColor:[255,0,0,.50],zoomFactor:50})
    // //   }else if(this.props.selectedLands.find(i=>i.id===element.attributes.PARCEL_SPATIAL_ID)){
    // highlightFeature(element,this.props.map,{layerName:"SelectLandsGraphicLayer",noclear:true,isZoom:true,isHiglightSymbol:true,highlighColor:[0,255,0,.50],zoomFactor:50})    
    //   }else{
    // highlightFeature(element,this.props.map,{layerName:"SelectLandsGraphicLayer",noclear:true,isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,255,.50],zoomFactor:50})      
    //   }
    });  
  }
}

OnParcelSelect=()=>{
  this.setState({parcelval:undefined})
  clearGraphicFromLayer(this.props.map,"SelectGraphicLayer")
 // esriRequest(mapUrl+'/'+this.LayerID.Landbase_Parcel).then(e=>{console.log(e)})
if(!this.props.selectedLands.filter(e=>e.id===this.state.parcelId).length){
  queryTask({
    ...querySetting(this.LayerID.Landbase_Parcel,`PARCEL_SPATIAL_ID =${this.state.parcelId}`,true,["SHAPE.AREA","PARCEL_PLAN_NO","USING_SYMBOL"]),
    callbackResult:(res)=>{
    getFeatureDomainName(res.features,this.LayerID.Landbase_Parcel).then((r)=>{
     // this.props.selectedLandsT.push(res)
      this.props.addLand({geo:r[0].geometry,res:r[0].attributes,id:this.state.parcelId})
      this.addParcelToSelect();  
      console.log(this.props.selectedLands)
    })
  }})
}
}
LandHoverOn = (f)=>{
  if(this.props.selectedLands.length){
  clearGraphicFromLayer(this.props.map,"SelectGraphicLayer")
  if(this.props.selectedLands.length){
  var e=this.state.parcelNum.filter(m=>m.i==f.key)[0]
  highlightFeature(e,this.props.map,{layerName:"SelectGraphicLayer",strokeColor:[255,255,0],isHighlighPolygonBorder:true,highlightWidth:8})
  }
  }
}

LandHoverOff = (f)=>{
  if(this.props.selectedLands.length){
  // var t=this.state.parcelNum.filter(m=>m.i==f.key)[0]
       
    var e=this.state.parcelNum.filter(m=>m.attributes.PARCEL_SPATIAL_ID==this.state.parcelId)[0]
    highlightFeature(e,this.props.map,{layerName:"SelectGraphicLayer",strokeColor:[255,255,0],isHighlighPolygonBorder:true,highlightWidth:8})
   
  }
  }

render() {
    return (
      <div>
<Spin spinning={this.state.spinning} tip="Loading...">
  </Spin>
      <div className="content-section implementation" style={{display:"flex"}}>
<MapComponent {...{...this.props}} ></MapComponent>
           <div>
             <div>
          <Select
          autoFocus
          onChange={this.onMunChange}
          showSearch
          value={this.state.munval}
          style={{ width: 200 }}
          placeholder="اختر اسم البلديه"
          disabled={!this.state.MunicipalityNames.length}
          optionFilterProp="children"
          filterOption={(input, option) =>{

            if(option.props.children){
              return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }else{
              return false
            }
          }
          }
          >
      {this.state.MunicipalityNames.map(e=><Option  key={e.code} value={e.code}>{e.name}</Option>)}
  </Select>
  </div>
  <div>
  <Select
     onChange={this.onPlaneChange}
     showSearch
     autoFocus
     disabled={!this.state.PlanNum.length}
     optionFilterProp="children"
     filterOption={(input, option) =>{
      if(option.props.children){
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }else{
        return false
      }
    }
     }

     style={{ width: 200 }}
     value={this.state.planeval}
     placeholder="رقم المخطط"
     notFoundContent="not found"
    >
      {this.state.PlanNum.map((d,i)=>{
       return( <Option key={i}  value={d.i}>{d.attributes.PLAN_NO}</Option>)
      })}      
  </Select>
  </div>
    <div>
  <Select
     onChange={this.onSubTypeChange}
     showSearch
     disabled={!this.state.subDivType.length}
     style={{ width: 200 }}
     value={this.state.subTypeval}
     placeholder={"نوع التقسيم"}
     optionFilterProp="children"
     filterOption={(input, option) =>{
      if(option.props.children){
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }else{
        return false
      }
    }
    }
    >
      {this.state.subDivType.map((e,i)=><Option key={i} value={e.code}>{e.name}</Option>)}
  </Select>
  </div>
  <div>
  <Select
     onChange={this.onSubNameChange}
     showSearch
     disabled={!this.state.subDivNames.length}
     style={{ width: 200 }}
     placeholder="اسم التقسيم"
     value={this.state.subNameval}
     optionFilterProp="children"
     filterOption={(input, option)=>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    >
      {this.state.subDivNames.map((e,i)=><Option key={i} value={e.attributes.SUBDIVISION_SPATIAL_ID}>{e.attributes.SUBDIVISION_DESCRIPTION}</Option>)}
  </Select>
    </div>
    <div>
  <Select
     onChange={this.onBlockChange}
     showSearch
     disabled={!this.state.blockNum.length}
     style={{ width: 200 }}
     value={this.state.blockval}
     placeholder="رقم البلوك"
     optionFilterProp="children"
     filterOption={(input, option)=>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    >
      {this.state.blockNum.map((e,i)=><Option key={i} value={e.attributes.BLOCK_SPATIAL_ID}>{e.attributes.BLOCK_NO}</Option>)}
  </Select>
    </div>
    <div>
  <Select
     onChange={this.onLandParcelChange}
     showSearch
     disabled={!this.state.parcelNum.length}
     onSearch={(e)=>{
       console.log(e)
       this.setState({parcelSearch:e})
     }}
     style={{ width: 200 }}
     value={this.state.parcelval}
     placeholder="رقم قطعة الارض"
     optionFilterProp="children"
      
    //  filterOption={(input, option)=>
    //   option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    // }
    >
    {this.state.parcelNum.filter((e,i)=> {
      if(this.state.parcelSearch){

        if(this.props.selectedLands.length){
          return !this.props.selectedLands.find(tt=>tt.res.PARCEL_PLAN_NO==e.attributes.PARCEL_PLAN_NO)&&i<200&&e.attributes.PARCEL_PLAN_NO&&e.attributes.PARCEL_PLAN_NO.toLowerCase().indexOf(this.state.parcelSearch.toLowerCase()) >= 0
          
        }else{
          debugger
          return e.attributes.PARCEL_PLAN_NO&&e.attributes.PARCEL_PLAN_NO.toLowerCase().indexOf(this.state.parcelSearch.toLowerCase()) >= 0
          
        }
      }else{
        
        if(this.props.selectedLands.length){
          return !this.props.selectedLands.find(tt=>tt.res.PARCEL_PLAN_NO==e.attributes.PARCEL_PLAN_NO)&&i<200&&e.attributes.PARCEL_PLAN_NO;
        }else{
          return e.attributes.PARCEL_PLAN_NO
        }
      }
      
      }).slice(0,100).map((e,i)=>{console.log(e);return(<Option onMouseEnter={this.LandHoverOn} onMouseLeave={this.LandHoverOff} key={e.i} value={e.i}>{e.attributes.PARCEL_PLAN_NO}</Option>)})}
  </Select>
    </div>
    <Button type="danger" disabled={this.state.parcelId === null} onClick={this.OnParcelSelect}>أضافة الارض</Button>
    </div>
      </div>
      <div>
    <LandTable {...{...this.props}}></LandTable>
      </div>
    </div>
    )
  }
}
// export default  connect(mapStateToProps,mapDispatchToProps)(IdentifyComponent)
export default  IdentifyComponent