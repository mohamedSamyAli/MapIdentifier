import React, { Component } from 'react';
import{LoadModules} from'../common/esri_loader'
import{mapUrl}from"../mapviewer/config/map"

import{connect}from "react-redux"



const styles =  {
  container: {
    height: '100vh',
    width: '100%'
  },
  mapDiv: {
    padding: 0,
    margin: 0,
    height: '100%',
    width: '100%'
  },
}

class MapComponent extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    
    console.log(this.props)
    LoadModules(["esri/layers/GraphicsLayer",'esri/map','esri/layers/ArcGISDynamicMapServiceLayer'])
      .then(([GraphicsLayer,Map,ArcGISDynamicMapServiceLayer]) => {
        this.SelectGraphicLayer = new GraphicsLayer({id:"SelectGraphicLayer"})
        this.SelectLandsGraphicLayer = new GraphicsLayer({id:"SelectLandsGraphicLayer"})
        this.map = new Map("map", {
         // basemap: 'dark-gray'
        });
        this.props.setmap(this.map)
        var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer
        (mapUrl, {
          "opacity" : 0.5
          ,"id":"kajshdfkjashd"
        });
      //  this.map.on("load",this.props.mapload)
        this.map.addLayer(dynamicMapServiceLayer); 
        this.map.addLayer(this.SelectLandsGraphicLayer)
        this.map.addLayer(this.SelectGraphicLayer)
      });

  }

  render() {
    return(
          <div style={styles.container}>
            <div id='map' Style="
    height: 100vh;
" >         
          </div>
       </div>
    )
  }
}

// export default connect(mapStateToProps,mapDispatchToProps)(MapComponent);
export default MapComponent