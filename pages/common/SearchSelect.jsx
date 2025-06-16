// components/TenureSelect.jsx
import React from 'react';
import CustomGroupedSelect from './CustomGroupedSelect';


const TenureSelect = ({
  label,
  fieldName,
  options,
  defaultValue,
  onChange,
  errorMessage,
  isFixedValue,
}) => {
  const formatGroupLabel = (data) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{data.label}</span>
      <span style={{
        backgroundColor: '#EBECF0',
        borderRadius: '2em',
        padding: '0.2em 0.6em',
        fontSize: 12,
        fontWeight: 'normal'
      }}>{data.options.length}</span>
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="text-regular text-2xl text-black mb-2">{label}</div>
      <CustomGroupedSelect
        defaultValue={defaultValue}
        options={options}
        onChange={(selected) => onChange(fieldName, selected.value)}
        formatGroupLabel={formatGroupLabel}
       
      />
      {errorMessage && (
        <div className="text-base text-light-red mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

export default TenureSelect;
