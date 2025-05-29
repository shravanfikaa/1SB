// Generic validations for different cases
function validateEntry(validation_field, value) {
  switch (validation_field) {
    case "pan":
      var regex = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
      return regex.test(value.toUpperCase()) ? true : false;
      break;
    case "name":
      var regex = /[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
      return regex.test(value) ? true : false;
      break;
    case "email":
      var regex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value) ? true : false;
      break;
    case "zip":
      var regex = /(^\d{6}$)/;
      return regex.test(value) ? true : false;
      break;
    case "share":
      var regex = /^100(\.[0]{1,2})?|([0-9]|[1-9][0-9])(\.[0-9]{1,2})?$/;
      return regex.test(value) ? true : false;
      break;
    case "accountnumber":
      var regex = /^\d{9,18}$/;
      return regex.test(value) ? true : false;
      break;
    case "password":
      var regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
      return regex.test(value) ? true : false;
      break;
    case "nomineeDateOfBirth":
      return (new Date() - value) / 86400000 <= 6574.5 ? false : true;
    case "nomineeGuardianDateOfBirth":
      return (new Date() - value) / 86400000 <= 6574.5 ? false : true;
      break;
    default:
      return false;
      break;
  }
}

function ValidateForm(allTempNominees, id='', field='', value='',validation_field=''){
    let share=0
    let isDataValid = true;
    let isInvalidDataFound = false
    let NameList={"nomineeFirstName":"Nominee First Name","nomineeMiddleName":"Nominee Middle Name","nomineeLastName":"Nominee Last Name","nomineePercentage":"Nominee Share","nomineeDateOfBirth":"Nominee Date of Birth",
          "nomineeGuardianFirstName":"Nominee Guardian First Name",
          "nomineePanNumber":"Nominee Pan Number",
          "nomineeGuardianMiddleName":"Nominee Guardian Middle Name","nomineeGuardianLastName":"Nominee Guardian Last Name","nomineeGuardianPanNumber":"Nominee Guardian Pan Number","nomineeZipCode":"Nominee Zip Code",}
    let validationManifestFile = {
      "nomineeFirstName": "name",
      "nomineeMiddleName": "name",
      "nomineeLastName": "name",
      "nomineeDateOfBirth":"nomineeDateOfBirth",
      "nomineePanNumber": "pan",
      "nomineePercentage": "share",
      "nomineeGuardianFirstName": "name",
      "nomineeGuardianMiddleName": "name",
      "nomineeGuardianLastName": "name",
      "nomineeGuardianPanNumber": "pan",
      "nomineeZipCode": "zip",
      "nomineeCity": "name",
      
    }
    let mandatoryFields = [
      "nomineeFirstName",
      "nomineeLastName",
      "nomineeDateOfBirth",
      "nomineePanNumber",
      "nomineePercentage",
      "nomineeGuardianFirstName",
      "nomineeGuardianLastName",
      "nomineeGuardianPanNumber",
      "nomineeZipCode",
      "nomineeCity",
      "nomineeCountry"
    ]

    for(let i in allTempNominees){
      if(! allTempNominees[i].hasOwnProperty("nomineeId")){
      let allFieldNames = Object.keys(allTempNominees[i])
      for(let fieldIndex in mandatoryFields){ 

        if(allTempNominees[i].hasOwnProperty(mandatoryFields[fieldIndex]) && allTempNominees[i][mandatoryFields[fieldIndex]] != null && allTempNominees[i][mandatoryFields[fieldIndex]].length < 2)
        {isDataValid=false;}
        if(!allTempNominees[i].hasOwnProperty(mandatoryFields[fieldIndex])){isDataValid = false;}
      }
      for (let j in allFieldNames){
        let key = allFieldNames[j]
        if(key=="field" || key == "value"){continue}
        document.getElementById(i+"_"+key)?document.getElementById(i+"_"+key).innerHTML="":""
        if(!document.getElementById(i+"_"+key)){
          continue
        }
        if(key=="nomineePercentage"){
          share+=Number(allTempNominees[i][key])
          if(share>100)
          {
            for(let i=0;i<allTempNominees.length;i++)                //Display error msg for all nominee, if share>100 
            {document.getElementById(i+"_"+key).innerHTML="Aggregated nominee share should be 100%";isDataValid=false;}
          }
          else{
            for(let i=0;i<allTempNominees.length;i++)
            {document.getElementById(i+"_"+key).innerHTML="";isDataValid=true;}
          }
        }

        if(allTempNominees[i][key] != "" && key != "field" && key != "value" && !validateEntry(validationManifestFile[key],allTempNominees[i][key]) && key!="nomineeDateOfBirth" && key!="nomineeGuardianDateOfBirth"){
          isInvalidDataFound = true;
          for(let item in NameList){
            if(key==item)
            {document.getElementById(i+"_"+key).innerHTML="Invalid "+NameList[item]+" value entered";}}
          isDataValid=false;
        }
        if(isInvalidDataFound == true){}
        if(key == "nomineeGuardianPanNumber" && allTempNominees[i].hasOwnProperty("nomineePanNumber") && allTempNominees[i][key].toUpperCase() == allTempNominees[i]["nomineePanNumber"].toUpperCase()){
          document.getElementById(i+"_"+key).innerHTML="Nominee PAN and Guardian PAN should not be equal";
          isDataValid=false;
        }
        // if(key == "nomineeGuardianDateOfBirth" && allTempNominees[i].hasOwnProperty("nomineeDateOfBirth") && allTempNominees[i][key] == allTempNominees[i]["nomineeDateOfBirth"]){
        //   document.getElementById(i+"_"+key).innerHTML="Nominee and Guardian Date of births should not be equal";
        // }
        if(key=="nomineeDateOfBirth"){
          document.getElementById(i+"_"+key+"_invalid").innerHTML="";
          document.getElementById(i+"_guardianDetailsInvalid").innerHTML="";
          document.getElementById(i+"_nomineeGuardianPanNumber").innerHTML="";
          document.getElementById(i+"_nomineeGuardianDateOfBirth").innerHTML="";
          
          if((new Date()-allTempNominees[i][key]) < 0 ){
            document.getElementById(i+"_"+key+"_invalid").innerHTML="Enter a valid guardian Date of Birth (Future DOB)";
            isDataValid=false;
          }       
            document.getElementById(i+"_guardianDetailSection")?document.getElementById(i+"_guardianDetailSection").style.display='none':null;
          // Below validations will be applied if Nominee as minor
          if((new Date()-allTempNominees[i][key]) > 0 && (new Date()-allTempNominees[i][key]) / 86400000 <= 6574.5){            

            document.getElementById(i+"_guardianDetailSection")?document.getElementById(i+"_guardianDetailSection").style.display='':null;
           
            let nomineeGuardianFirstName = allTempNominees[i].hasOwnProperty("nomineeGuardianFirstName") && allTempNominees[i]["nomineeGuardianFirstName"].length != 1?allTempNominees[i]["nomineeGuardianFirstName"]:""
            let nomineeGuardianLastName = allTempNominees[i].hasOwnProperty("nomineeGuardianLastName")?allTempNominees[i]["nomineeGuardianLastName"]:""
            let nomineeGuardianPanNumber = allTempNominees[i].hasOwnProperty("nomineeGuardianPanNumber")?allTempNominees[i]["nomineeGuardianPanNumber"]:""
            let nomineeGuardianDateOfBirth = allTempNominees[i].hasOwnProperty("nomineeGuardianDateOfBirth")?allTempNominees[i]["nomineeGuardianDateOfBirth"]:""
            if(nomineeGuardianFirstName == "" || nomineeGuardianLastName == ""){
              document.getElementById(i+"_guardianDetailsInvalid").innerHTML="Guardian First name & Last name are Mandatory.";
              isDataValid=false;
            }
            else if(nomineeGuardianFirstName.length < 3 || nomineeGuardianLastName.length < 3){
              document.getElementById(i+"_guardianDetailsInvalid").innerHTML="Enter a valid nominee first & last name";
              isDataValid=false;
            }
            if(nomineeGuardianPanNumber == "" || nomineeGuardianPanNumber.length != 10){
              document.getElementById(i+"_nomineeGuardianPanNumber").innerHTML="Guardian PAN number is required";
              isDataValid=false;
            }
            if(nomineeGuardianDateOfBirth == "" || nomineeGuardianDateOfBirth.length != 11){
              document.getElementById(i+"_nomineeGuardianDateOfBirth").innerHTML="Guardian DOB is mandatory";
              isDataValid=false;
            }
          }
        }
        // Guardian DOB specific validations
        if(key=="nomineeGuardianDateOfBirth"){
          document.getElementById(i+"_"+key+"_invalid")?document.getElementById(i+"_"+key+"_invalid").innerHTML="":"";

          document.getElementById(i+"_nomineeGuardianDateOfBirth")?document.getElementById(i+"_nomineeGuardianDateOfBirth").innerHTML="":"";
          
          if((new Date()-allTempNominees[i][key]) < 0 ){
            document.getElementById(i+"_nomineeGuardianDateOfBirth")?document.getElementById(i+"_"+key+"_invalid").innerHTML="Enter a valid guardian date of birth":null;
            isDataValid=false;
          }
          // Below validations will be applied if Guardian DOB < 18yrs
          if((new Date()-allTempNominees[i][key]) > 0 && (new Date()-allTempNominees[i][key]) / 86400000 <= 6574.5){
            document.getElementById(i+"_nomineeGuardianDateOfBirth")?document.getElementById(i+"_nomineeGuardianDateOfBirth").innerHTML="Enter a valid guardian date of birth":"";
              isDataValid=false;
          }
        }
        
      }
    }
    else if(allTempNominees[i].hasOwnProperty("nomineeId") && field=="nomineePercentage")   //Validation for nominee share, Ifwe select nominee from dropdown
    {
        share+=Number(allTempNominees[i]["nomineePercentage"])
        if(share>100)
        {
          for(let i=0;i<allTempNominees.length;i++)           //Display error msg for all nominee, if share>100 
          {document.getElementById(i+"_nomineePercentage").innerHTML="Aggregated nominee share should 100%";isDataValid=false;}
        }
        else{
          for(let i=0;i<allTempNominees.length;i++)           
          {document.getElementById(i+"_nomineePercentage").innerHTML="";isDataValid=true;}
        } 
    }
    }
    return isDataValid;
  }

export {
  validateEntry,
  ValidateForm,
};