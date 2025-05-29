function zipcodeResponseDefined(zipcoderesponse) {
  if (typeof zipcoderesponse != "undefined") {
    document.getElementById("curCity").value = zipcoderesponse["city"];
    document.getElementById("curState").value = zipcoderesponse["state"];
    document.getElementById("curCountry").value = zipcoderesponse["country"];
    if (zipcoderesponse["city"] == null && zipcoderesponse["state"] == null && zipcoderesponse["country"] == null) {
      //condition for unexisting zipcode entered
      document.getElementById("Cur_zipcode").innerHTML ="Zip code does not exists";}
       else {
        document.getElementById("Cur_zipcode").innerHTML ="";
        return {"communication_city": zipcoderesponse["city"],"communication_state": zipcoderesponse["state"],"communication_country": zipcoderesponse["country"]};
    }
  }
}
//when zipcode length greater than 6
function zipCodelengthNotSix() {
  document.getElementById("curCity").value = "";
  document.getElementById("curState").value = "";
  document.getElementById("curCountry").value = "";
  if(typeof zipcoderesponse == "undefined" ){  // if api gives  undefined response when incorrect zip entered
    document.getElementById('Cur_zipcode').innerHTML="Correct the ZIP code entered"        }

  return {"communication_city": "","communication_state": "","communication_country": "",
  };
}

export { zipcodeResponseDefined, zipCodelengthNotSix };
