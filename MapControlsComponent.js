import React, { Component } from 'react'
import{LoadModules} from'./Component/common/esri_loader'
import { esriRequest } from './Component/common/esri_request'
import { queryTask , getInfo,highlightFeature } from './Component/common/common_func'
import{mapUrl}from"./Component/mapviewer/config/map"
import { Select , Button , Spin, Alert,AutoComplete} from 'antd';
import 'antd/dist/antd.css';
import MapComponent from"./Component/MapComponent/MapComponent"
import{mapDispatchToProps,mapStateToProps}from"./Component/MapComponent/maping"
import{connect}from "react-redux"
import LandTable from'./Component/LandTable/LandTable'
import{querySetting,selectDis,DataQuery,queryOption}from'./Helpers'
var uniqid = require('uniqid');
const { Option } = Select;

 class MapControlsComponent extends Component {
     constructor(){
         super()
         this.PlanNum=[];
         this.parcelTs=[];
         this.selectionMode=false;
         console.log(this.props)
         this.state={
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
             poly:null
            }
     }
     LayerID= [];
    componentDidMount(){
      this.props.setSParcel(this.DrawGraph)
        LoadModules(["esri/layers/GraphicsLayer","esri/symbols/SimpleLineSymbol","esri/Color","esri/layers/FeatureLayer","esri/tasks/RelationshipQuery","esri/tasks/QueryTask","esri/tasks/query","esri/geometry/Polygon","esri/symbols/SimpleFillSymbol","esri/graphic"])
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
            debugger
            this.setState( { MunicipalityNames: response.types[0].domains.MUNICIPALITY_NAME.codedValues}) 
          })
//  new Promise((resolve, reject) =>{
//    let f = true
//    while(f){
//      console.log(f)
//      if(this.props.map){
//        this.props.map.addLayer(this.SelectGraphicLayer)
//        f=false;
//        resolve(1)
//      }
//    }
// }).then()

        })

        
     }
   drawPol = (res)=>{
    this.pol = new this.Polygon(res.features[0].geometry); 
    this.props.map.graphics.clear();
    //this.SelectGraphicLayer.add(new this.graphic(this.pol,this.SimpleFillSymbol))
    this.props.map.graphics.add(new this.graphic(this.pol,this.SimpleFillSymbol))
    this.props.map.setExtent(this.pol.getExtent())
   }
     onMunChange= (e)=>{
       this.props.restSelect()
      this.setState({
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

if(count==1){
  this.setState({spinning:false})
}else{count++}
      
queryTask({
  ...querySetting(15,`MUNICIPALITY_NAME="${e}"`,true,["MUNICIPALITY_NAME"]),
  callbackResult:(res)=>{
    highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})
   // this.drawPol(res)
    if(count==1){
      this.setState({spinning:false})
    }else{count++}
  }
})

// DataQuery(15,
//   [...queryOption(`MUNICIPALITY_NAME="${e}"`,true,["MUNICIPALITY_NAME"])],(res)=>{
//     this.drawPol(res)
//     if(count==1){
//       this.setState({spinning:false})
//     }else{count++}
//   })

queryTask({
  ...querySetting(this.LayerID.Plan_Data,`MUNICIPALITY_NAME="${e}"`,false,["PLAN_SPATIAL_ID","PLAN_NO"]),
  callbackResult:(res)=>{
    this.setState( { PlanNum: res.features.map((e,i)=>{return{...e,i:uniqid()}})})
    debugger
    if(count==1){
    this.setState({spinning:false})
    }else{count++}
    }
})
// DataQuery(this.LayerID.Plan_Data,
//   [...queryOption(`MUNICIPALITY_NAME="${e}"`,false,["PLAN_SPATIAL_ID","PLAN_NO"])],(res)=>{
//     this.setState( { PlanNum: res.features.map((e,i)=>{return{...e,i:uniqid()}})})
//     debugger
//     if(count==1){
//     this.setState({spinning:false})
//     }else{count++}
//     })
 }

    onPlaneChange = (f)=>{
      debugger
      this.props.restSelect()
      var e=this.state.PlanNum.filter(m=>m.i==f)[0].attributes.PLAN_SPATIAL_ID
      this.setState({
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
    highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})
   
          this.setState({planId:e}) 
          if(count==2){
            this.setState({spinning:false})
          }else{count++} 
        }})
      

 
      // DataQuery(this.LayerID.Plan_Data,
      //   [...queryOption(`PLAN_SPATIAL_ID="${e}"`,true,["MUNICIPALITY_NAME"])],(res)=>{
        
      //     this.drawPol(res)
      //     this.setState({planId:e}) 
      //     if(count==2){
      //       this.setState({spinning:false})
      //     }else{count++} 
      //   })
  

      queryTask({
        ...querySetting(this.LayerID.Survey_Block,`PLAN_SPATIAL_ID="${e}"`,false,["BLOCK_NO","BLOCK_SPATIAL_ID"]),
        callbackResult:(res)=>{  
          this.setState({blockNum:res.features})
           if(count==2){
             this.setState({spinning:false})
           }else{count++} 
          }})


    //  DataQuery(9,
    //   [...queryOption(`PLAN_SPATIAL_ID="${e}"`,false,["BLOCK_NO","BLOCK_SPATIAL_ID"])],(res)=>{  
    //     this.setState({blockNum:res.features})
    //      if(count==2){
    //        this.setState({spinning:false})
    //      }else{count++} 
    //     }) 

    queryTask({
      ...querySetting(this.LayerID.Landbase_Parcel,`PLAN_SPATIAL_ID="${e}"`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"]),
      callbackResult:(res)=>{
        this.setState({parcelNum:res.features.map((e,i)=>{return{...e,i}})})
        if(count==2){
         this.setState({spinning:false})
       }else{count++}   
      }})

    // DataQuery(8,
    //   [...queryOption(`PLAN_SPATIAL_ID="${e}"`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"])],(res)=>{
    //     this.setState({parcelNum:res.features.map((e,i)=>{return{...e,i}})})
    //     if(count==2){
    //      this.setState({spinning:false})
    //    }else{count++}   
    //   })

    }
    onSubTypeChange=(e)=>{
      this.setState({spinning:true})

      queryTask({
        ...querySetting(this.LayerID.Subdivision,`SUBDIVISION_TYPE=${e} AND PLAN_SPATIAL_ID=${this.state.planId}`,false,["SUBDIVISION_DESCRIPTION","SUBDIVISION_SPATIAL_ID"]),
        callbackResult:(res)=>{
          this.setState({subDivNames:res.features,spinning:false})   
        }})
      
      // DataQuery(10,
      //   [...queryOption(`SUBDIVISION_TYPE=${e} AND PLAN_SPATIAL_ID=${this.state.planId}`,false,["SUBDIVISION_DESCRIPTION","SUBDIVISION_SPATIAL_ID"])],(res)=>{
      //     this.setState({subDivNames:res.features,spinning:false})   
      //   })
        
      }
      onSubNameChange=(e)=>{
        this.setState({
          parcelNum:[],
          parcelId:null,
          spinning:true
        })
        var count =0;
        
        queryTask({
          ...querySetting(this.LayerID.Subdivision,`SUBDIVISION_SPATIAL_ID=${e}`,true,["SUBDIVISION_SPATIAL_ID"]),
          callbackResult:(res)=>{
            this.setState({subDivNames:res.features,spinning:false})   
    highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})
   
            if(count==1){
              this.setState({spinning:false})
            }else{count++} 
          }})


        // DataQuery(10,
        //   [...queryOption(`SUBDIVISION_SPATIAL_ID=${e}`,true,["SUBDIVISION_SPATIAL_ID"])],(res)=>{
        //     this.setState({subDivNames:res.features,spinning:false})   
        //     this.drawPol(res)
        //     if(count==1){
        //       this.setState({spinning:false})
        //     }else{count++} 
        //   })

        queryTask({
          ...querySetting(this.LayerID.Landbase_Parcel,`SUBDIVISION_SPATIAL_ID=${e}`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"]),
          callbackResult:(res)=>{
            this.setState({parcelNum:res.features.map((e,i)=>{return{...e,i}})})
            if(count==1){
              this.setState({spinning:false})
}else{count++} 
}})


  //         DataQuery(8,
  //           [...queryOption(`SUBDIVISION_SPATIAL_ID=${e}`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"])],(res)=>{
  //             this.setState({parcelNum:res.features.map((e,i)=>{return{...e,i}})})
  //             if(count==1){
  //               this.setState({spinning:false})
  // }else{count++} 
  // })
}

onBlockChange=(e)=>{
  this.setState({
    parcelId:null,
    parcelNum:[],
    spinning:true
  })
  var count =0;
  
  queryTask({
    ...querySetting(this.LayerID.Survey_Block,`BLOCK_SPATIAL_ID=${e}`,true,["BLOCK_SPATIAL_ID"]),
    callbackResult:(res)=>{
      highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25]})
      if(count==1){
        this.setState({spinning:false})
      }else{count++} 
    }})
  // DataQuery(9,
  //   [...queryOption(`BLOCK_SPATIAL_ID=${e}`,true,["BLOCK_SPATIAL_ID"])],(res)=>{
  //     this.drawPol(res)
  //     if(count==1){
  //       this.setState({spinning:false})
  //     }else{count++} 
  //   })
  queryTask({
    ...querySetting(this.LayerID.Landbase_Parcel,`BLOCK_SPATIAL_ID=${e}`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"]),
    callbackResult:(res)=>{
      this.setState({parcelNum:res.features.map((e,i)=>{return{...e,i}})})
      if(count==1){
        this.setState({spinning:false})
      }else{count++} 
    }})

    // DataQuery(8,
    //   [...queryOption(`BLOCK_SPATIAL_ID=${e}`,false,["PARCEL_SPATIAL_ID","PARCEL_PLAN_NO"])],(res)=>{
    //   this.setState({parcelNum:res.features.map((e,i)=>{return{...e,i}})})
    //   if(count==1){
    //     this.setState({spinning:false})
    //   }else{count++} 
    // })  
  }
  
  onLandParcelChange=(f)=>{
    debugger
    console.log(f,this.state.parcelNum)
    var e=this.state.parcelNum.filter(m=>m.i==f)[0].attributes.PARCEL_SPATIAL_ID
    this.setState({spinning:true})
    if(!this.props.selectedLands.length){
    this.RolBackPol = this.pol
    this.RolBackParcelNum = this.state.parcelNum
    var m = this.state
    }


    queryTask({
      ...querySetting(this.LayerID.Landbase_Parcel,`PARCEL_SPATIAL_ID="${e}"`,true,["PARCEL_SPATIAL_ID"]),
      callbackResult:(res)=>{
        // this.poll = new this.Polygon(res.features[0].geometry);    
        // var ex = this.poll.getExtent();
        // ex.xmin -= 50;
        // ex.ymin -= 50;
        // ex.xmax += 50;
        // ex.ymax += 50;
        // this.props.map.setExtent(ex)
        // this.setState({parcelId:e})
        // this.poll = new this.Polygon(res.features[0].geometry);  
        // this.props.map.graphics.clear();
        // this.props.map.graphics.add(new this.graphic(this.poll,this.SimpleFillSymbol))
    highlightFeature(res.features[0],this.props.map,{layerName:"SelectGraphicLayer",isZoom:true,isHiglightSymbol:true,highlighColor:[0,0,0,.25],zoomFactor:50})

        this.setState({spinning:false})
      }})

    // DataQuery(8,
    //   [...queryOption(`PARCEL_SPATIAL_ID="${e}"`,true,["PARCEL_SPATIAL_ID"])],(res)=>{
    //     this.poll = new this.Polygon(res.features[0].geometry);    
    //     var ex = this.poll.getExtent();
    //     ex.xmin -= 50;
    //     ex.ymin -= 50;
    //     ex.xmax += 50;
    //     ex.ymax += 50;
    //     this.props.map.setExtent(ex)
    //     this.setState({parcelId:e})
    //     this.poll = new this.Polygon(res.features[0].geometry);  
    //     this.props.map.graphics.clear();
    //     this.props.map.graphics.add(new this.graphic(this.poll,this.SimpleFillSymbol))
    //     this.setState({spinning:false})
    //   })

   
      }
  
  addParcelToSelect= ()=>{
    this.setState({spinning:true})
    this.setState({parcelId:this.props.selectedLands[this.props.selectedLands.length-1].id})
    


    queryTask({

    })


    var qt = new this.QueryTask(mapUrl+"/"+this.LayerID.Landbase_Parcel)
    const quer = new this.QueryOb()
    quer.geometry=new this.Polygon(this.props.selectedLands[this.props.selectedLands.length-1].geo)
    quer.geometry=this.poll
    quer.outFields = ["PARCEL_AREA","PARCEL_PLAN_NO","PARCEL_SPATIAL_ID"];
    quer.distance=1
  quer.returnGeometry=true
  quer.spatialRelationship =  this.QueryOb.SPATIAL_REL_INTERSECTS;
  qt.execute(quer,(res)=>{
    debugger
     res.features= res.features.map((e,i)=>{return{...e,i:uniqid()}})
    this.props.selectedLandsT.push(res)
    this.DrawGraph();
      this.setState({spinning:false})
      },(res)=>{console.log(res)})
}
DrawGraph=()=>{
  
  if(!this.props.selectedLands.length){
    this.props.map.graphics.clear();
    this.props.map.graphics.add(new this.graphic(this.RolBackPol,this.SimpleFillSymbol))
    this.props.map.setExtent(this.RolBackPol.getExtent())
    this.setState({parcelNum:this.RolBackParcelNum})
  }
  else{
    this.parcelDis = selectDis(this.props.selectedLandsT)
    debugger
    this.setState({parcelNum:this.parcelDis})
    this.props.map.graphics.clear();
    this.parcelDis.forEach(element => { 
      if(element.attributes.PARCEL_SPATIAL_ID==this.props.selectedLands[this.props.selectedLands.length-1].id)
      {
        this.props.map.graphics.add(new this.graphic(new this.Polygon(element.geometry),this.heighLightSymbol))
      }else if(this.props.selectedLands.find(i=>i.id===element.attributes.PARCEL_SPATIAL_ID)){
        this.props.map.graphics.add(new this.graphic(new this.Polygon(element.geometry),this.SheighLightSymbol))   
      }else{
        this.props.map.graphics.add(new this.graphic(new this.Polygon(element.geometry),this.SimpleFillSymbol))     
      }
    });  
  }
}
OnParcelSelect=()=>{
if(!this.props.selectedLands.filter(e=>e.id===this.state.parcelId).length){
 
  queryTask({
    ...querySetting(this.LayerID.Landbase_Parcel,`PARCEL_SPATIAL_ID =${this.state.parcelId}`,true,["PARCEL_AREA","PARCEL_PLAN_NO"]),
    callbackResult:(res)=>{
      this.props.addLand({geo:res.features[0].geometry,res:res.features[0].attributes,id:this.state.parcelId})
      this.addParcelToSelect();  
      console.log(this.props.selectedLands)
    }})
 
 
  // DataQuery(8,
  //   [...queryOption(`PARCEL_SPATIAL_ID =${this.state.parcelId}`,true,["PARCEL_AREA","PARCEL_PLAN_NO"])],(res)=>{
  //     this.props.addLand({geo:res.features[0].geometry,res:res.features[0].attributes,id:this.state.parcelId})
  //     this.addParcelToSelect();  
  //     console.log(this.props.selectedLands)
  //   })
  }
}
 
render() {
    return (
      <div>
<Spin spinning={this.state.spinning} tip="Loading...">
  </Spin>
      <div className="content-section implementation" style={{display:"flex"}}>
<MapComponent ></MapComponent>
           <div>
             <div>
          <Select
          autoFocus
          onChange={this.onMunChange}
          showSearch
          style={{ width: 200 }}
          placeholder="اختر اسم البلديه"
          disabled={!this.state.MunicipalityNames.length}
          optionFilterProp="children"
          filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          >
      {this.state.MunicipalityNames.map(e=><Option key={e.code} value={e.code}>{e.name}</Option>)}
  </Select>
  </div>
  <div>
  <Select
     onChange={this.onPlaneChange}
     showSearch
     autoFocus
     filterOption={false}

     optionFilterProp="children"
     filterOption={(input, option) =>
     option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
     }
     style={{ width: 200 }}
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
     placeholder={this.state.subDivType.length? "منطقه":"منطقه"}
     optionFilterProp="children"
     filterOption={(input, option) =>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
     onSearch={this.onSearch}
     style={{ width: 200 }}
     placeholder="رقم قطعة الارض"
     optionFilterProp="children"
     filterOption={(input, option)=>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    >
    {this.state.parcelNum.filter((e,i)=> i<200&&e.attributes.PARCEL_PLAN_NO).map((e,i)=>{console.log(e.i); return(<Option key={i} value={e.i}>{e.attributes.PARCEL_PLAN_NO}</Option>)})}
  </Select>
    </div>
    <Button type="danger" disabled={this.state.parcelId === null} onClick={this.OnParcelSelect}>أضافة الارض</Button>
    </div>
      </div>
      <div>
    <LandTable></LandTable>
      </div>
    </div>
    )
  }
}


export default  connect(mapStateToProps,mapDispatchToProps)(MapControlsComponent)