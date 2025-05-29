function preserveAddress(componentCache,currentComponentName,ckycdata){
    for (let[key,value] of Object.entries(componentCache[currentComponentName])){
   
        if((key.includes('label'))){
          continue;
        }
        else if((key.includes('communication_address1')) && !((value).includes(ckycdata.hasOwnProperty("ADDRESS DETAILS")
        && ckycdata["ADDRESS DETAILS"].hasOwnProperty("Permanent Address")
        ? ckycdata["ADDRESS DETAILS"]["Permanent Address"] : ckycdata["ADDRESS DETAILS"]["Permanent Address"]))){
          
        return false;
        }
         else if((key.includes('communication_address1')) && ((value).includes(ckycdata.hasOwnProperty("ADDRESS DETAILS")
        && ckycdata["ADDRESS DETAILS"].hasOwnProperty("Permanent Address")
        ? ckycdata["ADDRESS DETAILS"]["Permanent Address"] : ckycdata["ADDRESS DETAILS"]["Permanent Address"]))){
          
          return true
        }      
      
        else if(value==""){
        return false
        }
        
      }
      return false
}

export {preserveAddress};