import MultiSelectDropdown from "./multiselectdropdown"
import { useState, useEffect } from "react"
const data = [
  { id: 1, title: 'Yearly' },
  { id: 2, title: 'Half-Yearly' },
  { id: 3, title: 'Quaterly' },

]

function PaymentFrequencyList() {
  let jsonArray = []
  useEffect(() => {
    const example = sessionStorage.getItem('payout')
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
    sessionStorage.setItem('PaymentSelected', selected)
  })
  return (
    <MultiSelectDropdown options={jsonArray} selected={selected} toggleOption={toggleOption} name="Payment Frequency" />
  )
}
export default PaymentFrequencyList;

