'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function HistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sold_at', { ascending: false });
    if (error) {
      alert('โหลดประวัติการขายไม่สำเร็จ: ' + error.message);
    } else {
      setSales(data);
    }
    setLoading(false);
  }

  const grandTotal = sales.reduce((sum, sale) => sum + Number(sale.total_price), 0);

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  }

  return (
    <div>
      <h1>ประวัติการขาย</h1>

      <div className="card" style={{ backgroundColor: '#f0f4ff' }}>
        <strong>ยอดขายรวมทั้งหมด: {grandTotal.toLocaleString()} บาท</strong>
        <span style={{ marginLeft: '12px', color: '#555' }}>({sales.length} รายการ)</span>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table>
          <thead>
            <tr><th>วันเวลาที่ขาย</th><th>ชื่อสินค้า</th><th>จำนวน</th><th>ยอดรวม</th></tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{formatDateTime(sale.sold_at)}</td>
                <td>{sale.product_name}</td>
                <td>{sale.quantity}</td>
                <td>{Number(sale.total_price).toLocaleString()} บาท</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>ยังไม่มีประวัติการขาย</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
