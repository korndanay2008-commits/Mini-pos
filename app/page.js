'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  // รายการสินค้าทั้งหมด
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ฟอร์มเพิ่มสินค้าใหม่
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: '',
  });

  // สถานะการแก้ไข inline: เก็บ id ที่กำลังแก้ และค่าที่แก้ไข
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      alert('โหลดข้อมูลสินค้าไม่สำเร็จ: ' + error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name) {
      alert('กรุณากรอก SKU และชื่อสินค้า');
      return;
    }
    const { error } = await supabase.from('products').insert([
      {
        sku: newProduct.sku,
        name: newProduct.name,
        price: parseFloat(newProduct.price) || 0,
        stock: parseInt(newProduct.stock) || 0,
        unit: newProduct.unit,
      },
    ]);
    if (error) {
      alert('เพิ่มสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }
    setNewProduct({ sku: '', name: '', price: '', stock: '', unit: '' });
    fetchProducts();
  }

  function startEdit(product) {
    setEditingId(product.id);
    setEditValues({
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({});
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from('products')
      .update({
        sku: editValues.sku,
        name: editValues.name,
        price: parseFloat(editValues.price) || 0,
        stock: parseInt(editValues.stock) || 0,
        unit: editValues.unit,
      })
      .eq('id', id);
    if (error) {
      alert('บันทึกการแก้ไขไม่สำเร็จ: ' + error.message);
      return;
    }
    setEditingId(null);
    setEditValues({});
    fetchProducts();
  }

  async function handleDelete(id) {
    const confirmDelete = confirm('ยืนยันการลบสินค้านี้หรือไม่?');
    if (!confirmDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('ลบสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }
    fetchProducts();
  }

  return (
    <div>
      <h1>รายการสินค้า</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>เพิ่มสินค้าใหม่</h2>
        <form
          onSubmit={handleAddProduct}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <input type="text" placeholder="SKU" value={newProduct.sku}
            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
            style={{ width: '120px' }} />
          <input type="text" placeholder="ชื่อสินค้า" value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            style={{ width: '220px' }} />
          <input type="number" placeholder="ราคา" value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            style={{ width: '100px' }} />
          <input type="number" placeholder="คงเหลือ" value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            style={{ width: '100px' }} />
          <input type="text" placeholder="หน่วย" value={newProduct.unit}
            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
            style={{ width: '100px' }} />
          <button type="submit">+ เพิ่มสินค้า</button>
        </form>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SKU</th><th>ชื่อสินค้า</th><th>ราคา</th><th>คงเหลือ</th><th>หน่วย</th><th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isEditing = editingId === product.id;
              return (
                <tr key={product.id}>
                  {isEditing ? (
                    <>
                      <td><input type="text" value={editValues.sku}
                        onChange={(e) => setEditValues({ ...editValues, sku: e.target.value })}
                        style={{ width: '100px' }} /></td>
                      <td><input type="text" value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        style={{ width: '200px' }} /></td>
                      <td><input type="number" value={editValues.price}
                        onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                        style={{ width: '80px' }} /></td>
                      <td><input type="number" value={editValues.stock}
                        onChange={(e) => setEditValues({ ...editValues, stock: e.target.value })}
                        style={{ width: '80px' }} /></td>
                      <td><input type="text" value={editValues.unit}
                        onChange={(e) => setEditValues({ ...editValues, unit: e.target.value })}
                        style={{ width: '80px' }} /></td>
                      <td style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => saveEdit(product.id)}>บันทึก</button>
                        <button onClick={cancelEdit} style={{ backgroundColor: '#999' }}>ยกเลิก</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>{Number(product.price).toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>{product.unit}</td>
                      <td style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => startEdit(product)}>แก้ไข</button>
                        <button onClick={() => handleDelete(product.id)} style={{ backgroundColor: '#dc2626' }}>ลบ</button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>ยังไม่มีสินค้า</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
