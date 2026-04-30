import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePicker = ({ selectedDate, onChange }) => {
  const handleChange = (date) => {
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();
    onChange({ month: selectedMonth, year: selectedYear });
  };

  return (
    <DatePicker
      selected={selectedDate ? new Date(selectedDate.year, selectedDate.month) : null}
      onChange={handleChange}
      dateFormat="MM/yyyy"
      showMonthYearPicker
      customInput={<CustomInput />}
      dropdownMode="select"
    />
  );
};

const CustomInput = ({ value, onClick }) => (
  <select className="form-control" onClick={onClick}>
    <option value="">{value || 'Select Month/Year'}</option>
    {Array.from({ length: 12 }).map((_, index) => {
      const month = index + 1;
      return <option key={month} value={month}>{`${month}/${new Date().getFullYear()}`}</option>;
    })}
  </select>
);

export default CustomDatePicker;
