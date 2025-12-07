
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const emptyProduct: Omit<Product, 'id'> = { name: '', unit: '', price: 0 };

const ProductList: React.FC<ProductListProps> = ({ products, setProducts }) => {
  const [currentProduct, setCurrentProduct] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSave = () => {
    if (!currentProduct.name || !currentProduct.unit || currentProduct.price <= 0) {
      alert('لطفاً تمام فیلدها را به درستی پر کنید.');
      return;
    }

    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? { id: editingProductId, ...currentProduct } : p));
      setEditingProductId(null);
    } else {
      setProducts([...products, { id: crypto.randomUUID(), ...currentProduct }]);
    }
    setCurrentProduct(emptyProduct);
  };
  
  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setCurrentProduct(product);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این محصول مطمئن هستید؟')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
           <h2 className="text-xl font-bold text-slate-800 mb-6">مدیریت محصولات و خدمات</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                name="name"
                value={currentProduct.name}
                onChange={handleChange}
                placeholder="نام محصول/خدمت"
                className="md:col-span-2 w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <input
                name="unit"
                value={currentProduct.unit}
                onChange={handleChange}
                placeholder="واحد (مثلا: عدد)"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <div className="flex gap-2 md:col-start-4 row-start-2 md:row-start-1">
                     <input
                    type="number"
                    name="price"
                    value={currentProduct.price}
                    onChange={handleChange}
                    placeholder="قیمت"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all whitespace-nowrap">
                    {editingProductId ? 'ویرایش' : 'افزودن'}
                    </button>
                </div>
            </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4">نام محصول/خدمت</th>
              <th scope="col" className="px-6 py-4">واحد</th>
              <th scope="col" className="px-6 py-4">قیمت واحد (ریال)</th>
              <th scope="col" className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {product.name}
                </th>
                <td className="px-6 py-4 text-slate-500">{product.unit}</td>
                <td className="px-6 py-4 font-medium">{product.price.toLocaleString('fa-IR')}</td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <button onClick={() => handleEdit(product)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors font-medium">ویرایش</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors font-medium">حذف</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-400">
                        <p>هیچ محصولی ثبت نشده است.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;