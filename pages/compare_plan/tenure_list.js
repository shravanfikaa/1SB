import { useTranslation } from "react-i18next";
import MultiSelectDropdown from "./multiselectdropdown"
  import { useState } from "react"
  const data = [
      { id: 1, title: '2.3%' },
      { id: 2, title: '3.6%' },
      { id: 3, title: '4.9%' },
     
  ]
  
  function FDTenureList(){
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
  
      return (
          <MultiSelectDropdown options={data} selected={selected} toggleOption={toggleOption} name="Tenure"/>
      )
  }
  export default FDTenureList;

