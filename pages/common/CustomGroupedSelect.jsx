import React from 'react';
import Select from 'react-select';

const CustomGroupedSelect = ({
  defaultValue,
  options,
  formatGroupLabel,
  onChange,
  isDisabled = false,
  getOptionLabel, // <-- New prop
}) => {
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af',
      },
    }),
    option: (base, { isSelected, isFocused }) => ({
      ...base,
      backgroundColor: isSelected
        ? '#2563eb'
        : isFocused
        ? '#e0f2fe'
        : '#ffffff',
      color: isSelected ? '#ffffff' : '#111827',
      cursor: 'pointer',
      padding: 10,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    singleValue: (base) => ({
      ...base,
      color: '#111827',
    }),
  };

  return (
    <Select
      defaultValue={defaultValue}
      options={options}
      formatGroupLabel={formatGroupLabel}
      onChange={onChange}
      isDisabled={isDisabled}
      styles={customStyles}
      getOptionLabel={getOptionLabel} // <-- Add here
    />
  );
};

export default CustomGroupedSelect;
