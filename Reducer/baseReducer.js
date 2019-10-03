const initialState = {
  map:null,
  domainName:null,
  selectedLands:[],
  selectedLandsT:[],
  addParcelToSelect:null 
};

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case"restSelect":
        return {
            ...state,
            selectedLands:[],
            selectedLandsT:[]
        }
        case 'setMap':
            return {
                ...state,
                map:action.value
            }
            case 'setSParcel':
            return {
                ...state,
                addParcelToSelect:action.value
            }
            case 'setDomaim':
               
                return {
                    ...state,
                    
                }
            case 'AddLand':
            return {
                ...state,
                selectedLands:state.selectedLands.concat(action.value)
            }
            case 'DelLand':
                
             state.selectedLands.pop()
             state.selectedLandsT.pop()
             var arr = [...state.selectedLands]
             var arr2 = [...state.selectedLandsT]

             state.addParcelToSelect()
                return {
                    ...state,
                    selectedLands:arr,
                    selectedLandsT:arr2
                }
                default: return state
            }    
    return state;
};

export default reducer;