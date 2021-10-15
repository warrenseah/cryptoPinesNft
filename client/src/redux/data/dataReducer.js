const initialState = {
  loading: false,
  name: "",
  availableSupply: 0,
  maxSupply: 0,
  cost: 0,
  maxMintAmount: 0,
  error: false,
  errorMsg: "",
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...state,
        loading: true,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...state,
        loading: false,
        name: action.payload.name,
        availableSupply: action.payload.availableSupply,
        maxSupply: action.payload.maxSupply,
        cost: action.payload.cost,
        maxMintAmount: action.payload.maxMintAmount,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_FAILED":
      return {
        ...initialState,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
