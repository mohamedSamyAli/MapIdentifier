import React, { Component } from 'react'
import { loadModules } from 'esri-loader';
import { Select , Button} from 'antd';
import 'antd/dist/antd.css';
import { Table } from 'reactstrap'
import MapComponent from"../MapComponent/MapComponent"
import{connect}from "react-redux"

 class LandTable extends Component {
  render() {
      console.log(this.props)
    return (
      <div>
     <Table dark>
        <thead>
          <tr>
            <th>ID</th>
            <th>رقم القطعه</th>
            <th>المساحه</th>
            <th>الاستخدام</th>
          </tr>
        </thead>
        <tbody>
        {this.props.selectedLands.map((e,i)=>{return(
          <tr key={i}>
          <td >{e.id}</td>
          <td>{e.res.PARCEL_PLAN_NO}</td>
          <td>{e.res["SHAPE.AREA"]}</td>
          <td>{e.res.USING_SYMBOL_Code}</td>
     {i===this.props.selectedLands.length-1?
     <td><Button onClick={this.props.DEL}>DEL</Button></td>
    :''
}
{}
        </tr>
        )})}
        </tbody>
      </Table>

    {/* <Table dataSource={this.props.selectedLands}>
    <Column title="ID" dataIndex="id" key="id" />
    <Column title="Parcel_Plane_No" dataIndex="res.PARCEL_PLAN_NO" key="PARCEL_PLAN_NO" />
    <Column title="SHAPE.AREA" dataIndex="res.SHAPE.AREA" key="SHAPE.AREA" />
    <Column
      title="Action"
      key="action"
      render={(text, record) => (
       if() <Button  >DELETE</Button>
      )}
    />
  </Table>, */}




      </div>
    )
  }
}


// export default  connect(mapStateToProps,mapDispatchToProps)(LandTable)
export default  LandTable