import MultiSelectDropdown from "./multiselectdropdown"
import appConfig from "../../app.config";
import { GetApiHandler, PostApiHandler } from "../api/apihandler"
import FDplans from "../product/fd_plan";
import { useState, useEffect, createContext, useContext } from "react";
import example1 from "../product/fd_plan"
export const ManufacturerListContext = createContext();
const data = [
  { id: 1, title: 'BAJAJ' },
  { id: 2, title: 'HDFC' },
  { id: 3, title: 'ICICI' },

]
function Manufacturerlist() {
  let jsonArray = []
  useEffect(() => {
    const example = sessionStorage.getItem('Issuers')
    let mainArray = example.split(",");
    mainArray.sort();
    for (let i = 0; i < mainArray.length; i++) {
      const jsonBody = {
        id: "",
        title: ""
      }
      jsonBody.id = mainArray[i]
      jsonBody.title = mainArray[i]
      jsonArray.push(jsonBody)
    }
  })
  const [selected, setSelected] = useState([])

  const toggleOption = ({ id }) => {
    setSelected(prevSelected => {
      // if it's in, remove
      const newArray = [...prevSelected]
      if (newArray.includes(id)) {
        return newArray.filter(item => item != id)
        // else, add
      } else {
        newArray.push(id)

        return newArray;
      }
    })


  }
  useEffect(() => {
    sessionStorage.setItem('ManufacturerSelected', selected)

  })

  return (
    <ManufacturerListContext.Provider value={{ selected }} >
      <div>
        <MultiSelectDropdown options={jsonArray} selected={selected} toggleOption={toggleOption} name="Issuer Name" />
      </div>
    </ManufacturerListContext.Provider>
  )
}
export default Manufacturerlist;
