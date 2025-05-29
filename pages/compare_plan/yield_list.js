import { useTranslation } from "react-i18next"
import MultiSelectDropdown from "./multiselectdropdown"
import { useState, useEffect } from "react"
const data = [
  { id: 1, title: '2.3%' },
  { id: 2, title: '3.6%' },
  { id: 3, title: '4.9%' },

]

function YieldList() {
  let jsonArray = []
  useEffect(() => {
    const example = sessionStorage.getItem('yield')
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
  const { t: translate } = useTranslation();
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
    sessionStorage.setItem('yieldSelected', selected)

  })
  return (
    <MultiSelectDropdown options={jsonArray} selected={selected} toggleOption={toggleOption} name="Yield" />
  )
}
export default YieldList;

