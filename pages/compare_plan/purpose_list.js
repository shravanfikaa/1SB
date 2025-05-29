import MultiSelectDropdown from "./multiselectdropdown"
  import { useState } from "react"
  const data = [
      { id: 1, title: 'Purpose 1' },
      { id: 2, title: 'Purpose 2' },
      { id: 3, title: 'Purpose 3' },
     
  ]
  function Purposelist(){
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
          <MultiSelectDropdown options={data} selected={selected} toggleOption={toggleOption} name="Purpose"/>
      )
  }
  export default Purposelist;

