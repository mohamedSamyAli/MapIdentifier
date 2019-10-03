import React, { Component } from 'react'
import IdentifyComponent from '../IdentifyComponnent/IdentifyComponent'
import { thisExpression } from '@babel/types';
export default class PropsComponent extends Component {
constructor(){
    super()
    this.state = {
            map:null,
            domainName:null,
            selectedLands:[],
            selectedLandsT:[],
            addParcelToSelect:null 
    }

}
setSParcel =(e)=>{
    this.setState({addParcelToSelect:e})
}
restSelect=()=>{
    this.setState({ selectedLands:[],
        selectedLandsT:[]})
}
AddLand=(e)=>{
    let a = this.state.selectedLands.concat(e)
    this.setState({selectedLands:a})
}

DelLand=()=>{
    this.state.selectedLands.pop()
    this.state.selectedLandsT.pop()
    var arr = [...this.state.selectedLands]
    var arr2 = [...this.state.selectedLandsT]
    this.setState({
        selectedLands:arr,
        selectedLandsT:arr2
    })
}     

setmap=(e)=>{
    this.setState({map:e})
}



    render() {


    return (
      <div>
        <IdentifyComponent 
        {...{...this.state}} 
        setmap={this.setmap}
        DEL={this.DelLand}
        addLand={this.AddLand}
        setSParcel={this.setSParcel}
        restSelect={this.restSelect}
        ></IdentifyComponent>
      </div>
    )
  }
}
