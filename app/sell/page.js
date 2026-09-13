'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SellPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      alert('โหลดข้อมูลสินค้าไม่สำเร็จ: ' + error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const qtyNumber = parseInt(quantity) || 0;
  const totalPrice = selectedProduct ? selectedProduct.price * qtyNumber : 0;

  function resetForm() {
    setSelectedProductId('');
    setQuantity('');
  }

  async function handleSell(e) {
    e.preventDefault();
    if (!selectedProduct) {
      alert('กรุณาเลือกสินค้า');
      return;
    }
    if (!qtyNumber || qtyNumber <= 0) {
      alert('กรุณากรอกจำนวนให้ถูกต้อง');
      return;
    }
    if (qtyNumber > selectedProduct.stock) {
      alert(`สินค้าคงเหลือไม่พอ (คงเหลือ ${selectedProduct.stock} ${selectedProduct.unit})`);
      return;
    }

    setSubmitting(true);

    const { error: saleError } = await supabase.from('sales').insert([
      {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: qtyNumber,
        total_price: totalPrice,
        sold_at: new Date().toISOString(),
      },
    ]);
    if (saleError) {
      alert('บันทึกการขายไม่สำเร็จ: ' + saleError.message);
      setSubmitting(false);
      return;
    }

    const newStock = selectedProduct.stock - qtyNumber;
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', selectedProduct.id);
    if (stockError) {
      alert('บันทึกการขายสำเร็จ แต่ปรับปรุงสต็อกไม่สำเร็จ: ' + stockError.message);
      setSubmitting(false);
      return;
    }

    alert(`ขายสำเร็จ! ${selectedProduct.name} x ${qtyNumber} รวม ${totalPrice.toLocaleString()} บาท`);
    resetForm();
    setSubmitting(false);
    fetchProducts();
  }

  return (
    <div>
      <h1>ขายสินค้า</h1>
      <div className="card">
        {loading ? (
          <p>กำลังโหลดข้อมูลสินค้า...</p>
        ) : (
          <form onSubmit={handleSell}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>สินค้า</label>
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} style={{ width: '100%' }}>
                <option value="">-- เลือกสินค้า --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {Number(p.price).toLocaleString()} บาท (คงเหลือ {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>จำนวน</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '150px' }} placeholder="0" />
            </div>

            <div className="card" style={{ backgroundColor: '#f0f4ff' }}>
              <strong>ยอดรวม: {totalPrice.toLocaleString()} บาท</strong>
            </div>

            <button type="submit" disabled={submitting} style={{ marginTop: '14px' }}>
              {submitting ? 'กำลังบันทึก...' : 'ขาย'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
