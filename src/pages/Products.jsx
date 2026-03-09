import { useEffect, useState } from "react";
import API from "../api/axios";
import ProductForm from "../components/ProductForm";

function Products() {

  const [products,setProducts] = useState([]);
  const [editProduct,setEditProduct] = useState(null);

  const fetchProducts = async ()=>{
    const res = await API.get("/products");
    setProducts(res.data);
  };

  useEffect(()=>{
    fetchProducts();
  },[]);

  const addProduct = async (data)=>{
    if(editProduct){
      await API.put(`/products/${editProduct._id}`, data);
      setEditProduct(null);
    }else{
      await API.post("/products", data);
    }
    fetchProducts();
  };

  const deleteProduct = async (id)=>{
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  const edit = (product)=>{
    setEditProduct(product);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Products</h1>

      <ProductForm 
        onSubmit={addProduct} 
        productToEdit={editProduct} 
        onCancel={()=>setEditProduct(null)}
      />

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p=>(
            <tr key={p._id} className="border-t">
              <td className="p-3">{p.name}</td>
              <td>${p.price}</td>
              <td>{p.category}</td>
              <td className="p-3 space-x-2">
                <button 
                  onClick={()=>edit(p)} 
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >Edit</button>
                <button 
                  onClick={()=>deleteProduct(p._id)} 
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Products;