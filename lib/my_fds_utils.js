function FRNummberInAPIResponse(FDRNumber,FdApiData,tempTypeArray,id){

    for(let i=0;i<FdApiData.length;i++){
      if(FdApiData[i]["id"]==id){
        FdApiData[i]["fdr_number"]=FDRNumber
        FdApiData[i]["status"]="Success"}
      tempTypeArray=FdApiData
    }
  }
  export {FRNummberInAPIResponse}