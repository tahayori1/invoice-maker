
import React from 'react';
import { Party, PartyType } from '../types';

interface PartyFormProps {
  party: Party;
  setParty: (party: Party) => void;
  title: string;
}

const PartyForm: React.FC<PartyFormProps> = ({ party, setParty, title }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParty({ ...party, [name]: value });
  };
  
  const handleTypeChange = (type: PartyType) => {
    setParty({ ...party, type });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <div className="flex p-1 bg-slate-100 rounded-lg mt-2 sm:mt-0">
            <button
            type="button"
            onClick={() => handleTypeChange(PartyType.NATURAL)}
            className={`px-4 py-1.5 text-sm rounded-md transition-all duration-200 ${
                party.type === PartyType.NATURAL 
                ? 'bg-white text-blue-700 shadow-sm font-medium' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
            >
            شخص حقیقی
            </button>
            <button
            type="button"
            onClick={() => handleTypeChange(PartyType.LEGAL)}
            className={`px-4 py-1.5 text-sm rounded-md transition-all duration-200 ${
                party.type === PartyType.LEGAL 
                ? 'bg-white text-blue-700 shadow-sm font-medium' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
            >
            شخص حقوقی
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {party.type === PartyType.NATURAL ? (
          <>
            <InputField label="نام و نام خانوادگی" name="fullName" value={party.fullName || ''} onChange={handleChange} required />
            <InputField label="کد ملی / کد فراگیر" name="nationalId" value={party.nationalId || ''} onChange={handleChange} required />
            <InputField label="شماره همراه" name="mobile" value={party.mobile || ''} onChange={handleChange} required />
          </>
        ) : (
          <>
            <InputField label="نام ثبت شده شرکت" name="companyName" value={party.companyName || ''} onChange={handleChange} required />
            <InputField label="شماره ثبت" name="registrationNumber" value={party.registrationNumber || ''} onChange={handleChange} />
            <InputField label="شناسه ملی" name="companyId" value={party.companyId || ''} onChange={handleChange} required />
            <InputField label="شماره تماس" name="phone" value={party.phone || ''} onChange={handleChange} />
          </>
        )}
        <InputField label="شماره اقتصادی" name="economicCode" value={party.economicCode || ''} onChange={handleChange} />
        <InputField label="کد پستی" name="postalCode" value={party.postalCode || ''} onChange={handleChange} />
        <InputField label="استان" name="province" value={party.province || ''} onChange={handleChange} />
        <InputField label="شهرستان" name="city" value={party.city || ''} onChange={handleChange} />
        <div className="md:col-span-2 lg:col-span-3">
          <InputField label="آدرس" name="address" value={party.address || ''} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }> = ({ label, name, value, onChange, required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
    />
  </div>
);


export default PartyForm;
