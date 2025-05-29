//declaring the ckyc json without any data in it
let presentData= {
    "PERSONAL DETAILS": {
        "Title": "",
        "FirstName": "",
        "MiddleName": "",
        "LastName": "",
        "MobileNumber": "",
        "Dob": "",
        "Email": "",
        "pan_number": "",
        "PhotoGraph": {
            "sequenceNo": "",
            "imageType": "",
            "imageCode": "",
            "globalFlag": "",
            "branchCode": "",
            "imageData": ""
        }
  
    },
    "ADDRESS DETAILS": {
  
        "Permanent Address": "",
        "permanentCity": "",
        "permanentDistrict": "",
        "permanentState": "",
        "permanentCountry": "",
        "Permanent PinCode": "",
        "Communication Address": "",
        "communicationCity": "",
        "communicationDistrict": "",
        "communicationState": "",
        "communicationCountry": "",
        "Communication PinCode": ""
    },
    "PARENT & SPOUSE DETAILS": {
        "Father Details": {
            "Frist Name": "",
            "Last Name": "",
            "Middle Name": ""
        },
        "Mother Details": {
            "Frist Name": "",
            "Last Name": "",
            "Middle Name": ""
        },
        "Spouse Details": {
          "Frist Name": "",
          "Last Name": "",
          "Middle Name": ""
      }
    }
  } 


function dataConversion(newData,basicFieldJson,addressFieldJson,profileImageJson){
    // mapping of basic customer personal details 
    for(let i=0;i<Object.keys(basicFieldJson).length;i++){
        presentData["PERSONAL DETAILS"][Object.keys(basicFieldJson)[i]]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty(Object.values(basicFieldJson)[i])  &&  newData["pidData"]["personalDetails"][Object.values(basicFieldJson)[i]]  ?newData["pidData"]["personalDetails"][Object.values(basicFieldJson)[i]] :""
    }
    // mapping customer personal address details
    for(let i=0;i<Object.keys(addressFieldJson).length;i++){
        presentData["ADDRESS DETAILS"][Object.keys(addressFieldJson)[i]]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty(Object.values(addressFieldJson)[i])  &&  newData["pidData"]["personalDetails"][Object.values(addressFieldJson)[i]]  ?newData["pidData"]["personalDetails"][Object.values(addressFieldJson)[i]] :""
        if(Object.keys(addressFieldJson)[i]=="Permanent Address"){
            presentData["ADDRESS DETAILS"]["Permanent Address"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && ((newData["pidData"]["personalDetails"].hasOwnProperty("permLine1")  &&  newData["pidData"]["personalDetails"]["permLine1"]) || (newData["pidData"]["personalDetails"].hasOwnProperty("permLine2")  &&  newData["pidData"]["personalDetails"]["permLine2"]) || (newData["pidData"]["personalDetails"].hasOwnProperty("permLine3")  &&  newData["pidData"]["personalDetails"]["permLine3"]))   ? newData["pidData"]["personalDetails"]["permLine1"]  + newData["pidData"]["personalDetails"]["permLine2"] + newData["pidData"]["personalDetails"]["permLine3"]:"" 
        }
    }
    //mapping customer personal photo details
    for(let i=0;i<Object.keys(profileImageJson).length;i++){
        presentData["PERSONAL DETAILS"]["PhotoGraph"][Object.keys(profileImageJson)[i]]= newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("imageDetails") && newData["pidData"]["imageDetails"].hasOwnProperty("image")  &&  newData["pidData"]["imageDetails"]["image"] && newData["pidData"]["imageDetails"]["image"].hasOwnProperty("0")  && newData["pidData"]["imageDetails"]["image"][0][Object.values(profileImageJson)[i]] ?newData["pidData"]["imageDetails"]["image"][0][Object.values(profileImageJson)[i]] :""
    }
    //mapping parents and spouse details of customer
     presentData["PARENT & SPOUSE DETAILS"]["Father Details"]["Frist Name"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("fatherFname")  &&  newData["pidData"]["personalDetails"]["fatherFname"]  ? newData["pidData"]["personalDetails"]["fatherFname"] :""  
     presentData["PARENT & SPOUSE DETAILS"]["Father Details"]["Middle Name"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("fatherMname")  &&  newData["pidData"]["personalDetails"]["fatherMname"]  ? newData["pidData"]["personalDetails"]["fatherMname"] :"" 
     presentData["PARENT & SPOUSE DETAILS"]["Father Details"]["Last Name"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("fatherLname")  &&  newData["pidData"]["personalDetails"]["fatherLname"]  ? newData["pidData"]["personalDetails"]["fatherLname"] :""  
     presentData["PARENT & SPOUSE DETAILS"]["Mother Details"]["Frist Name"]= newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("motherFname")  &&  newData["pidData"]["personalDetails"]["motherFname"]  ? newData["pidData"]["personalDetails"]["motherFname"] :""  
     presentData["PARENT & SPOUSE DETAILS"]["Mother Details"]["Middle Name"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("motherMname")  &&  newData["pidData"]["personalDetails"]["motherMname"]  ? newData["pidData"]["personalDetails"]["motherMname"] :"" 
     presentData["PARENT & SPOUSE DETAILS"]["Mother Details"]["Last Name"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("motherLname")  &&  newData["pidData"]["personalDetails"]["motherLname"]  ?newData["pidData"]["personalDetails"]["motherLname"]  :""
     presentData["PARENT & SPOUSE DETAILS"]["Spouse Details"]["Frist Name"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("maidenFname")  &&  newData["pidData"]["personalDetails"]["maidenFname"]  ?newData["pidData"]["personalDetails"]["maidenFname"] :"" 
     presentData["PARENT & SPOUSE DETAILS"]["Spouse Details"]["Middle Name"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("maidenMname")  &&  newData["pidData"]["personalDetails"]["maidenMname"]  ?newData["pidData"]["personalDetails"]["maidenMname"] :"" 
     presentData["PARENT & SPOUSE DETAILS"]["Spouse Details"]["Last Name"]=newData!=null && newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("personalDetails") && newData["pidData"]["personalDetails"].hasOwnProperty("maidenLname")  &&  newData["pidData"]["personalDetails"]["maidenLname"]  ?newData["pidData"]["personalDetails"]["maidenLname"] :"" 
     return presentData
}

function clearingImageData(newData){
 // clearing image data from total ckyc api response after storing the data in session storage
 if (newData.hasOwnProperty("PERSONAL DETAILS") && newData["PERSONAL DETAILS"].hasOwnProperty("PhotoGraph")){
    newData["PERSONAL DETAILS"]["PhotoGraph"]["imageData"]=""
  }
   let images=newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("imageDetails") && newData["pidData"]["imageDetails"].hasOwnProperty("image")  &&  newData["pidData"]["imageDetails"]["image"] && newData["pidData"]["imageDetails"]["image"]?newData["pidData"]["imageDetails"]["image"]:1
  for(let j=0;j<images.length;j++){
    if(newData.hasOwnProperty("pidData") && newData["pidData"].hasOwnProperty("imageDetails") && newData["pidData"]["imageDetails"].hasOwnProperty("image")  &&  newData["pidData"]["imageDetails"]["image"] && newData["pidData"]["imageDetails"]["image"] && newData["pidData"]["imageDetails"]["image"].hasOwnProperty(j)  && newData["pidData"]["imageDetails"]["image"][j].hasOwnProperty("imageData") && newData["pidData"]["imageDetails"]["image"][j]["imageData"]) {
      newData["pidData"]["imageDetails"]["image"][j]["imageData"]=""
  }
}
return newData
}
export {dataConversion,clearingImageData}