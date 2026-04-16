import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SERVER_URL } from "../../config";

export default function Overview() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Cấu hình Header chứa Token
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // TÁCH RIÊNG 2 API: Để nếu lỗi 401 ở Users, Orders vẫn load được bình thường
      try {
        const ordersRes = await axios.get(`${SERVER_URL}/api/orders`, config);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Đơn hàng:", error);
      }

      try {
        const usersRes = await axios.get(`${SERVER_URL}/api/auth/users`, config);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Người dùng (Thường do lỗi 401 Phân quyền):", error);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.filter(o => o.status === "Đã giao").reduce((sum, o) => sum + o.totalAmount, 0);
  const COLORS = ['#F97316', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#6B7280'];
  
  const orderStatusData = [
    { name: 'Chờ thanh toán', value: orders.filter(o => o.status === "Chờ thanh toán").length },
    { name: 'Chờ xác nhận', value: orders.filter(o => o.status === "Chờ xác nhận").length },
    { name: 'Đang chuẩn bị', value: orders.filter(o => o.status === "Đang chuẩn bị").length },
    { name: 'Đang giao', value: orders.filter(o => o.status === "Đang giao").length },
    { name: 'Đã giao', value: orders.filter(o => o.status === "Đã giao").length },
    { name: 'Đã hủy', value: orders.filter(o => o.status === "Đã hủy").length },
  ].filter(item => item.value > 0); 

  const revenueByDate = orders.filter(o => o.status === "Đã giao").reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'});
      acc[date] = (acc[date] || 0) + order.totalAmount;
      return acc;
  }, {});
  const revenueChartData = Object.keys(revenueByDate).map(date => ({ date, revenue: revenueByDate[date] })).slice(-7); 

  const userSpending = {};
  const productSales = {};
  
  orders.forEach(o => {
    if (o.status === "Đã giao") {
      const key = o.customer?.phone || "Khách ẩn danh";
      if (!userSpending[key]) userSpending[key] = { name: o.customer?.fullName || "Khách", phone: key, totalSpent: 0, orderCount: 0 };
      userSpending[key].totalSpent += o.totalAmount;
      userSpending[key].orderCount += 1;
    }
    if (o.status !== "Đã hủy") {
      o.items?.forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += (item.price * item.quantity);
      });
    }
  });

  const topUsersList = Object.values(userSpending).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  const topProductsList = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-gray-400 font-bold mb-2 text-xs uppercase tracking-wider">Doanh Thu (Đã giao)</h3>
          <p className="text-3xl font-black text-orange-500">{totalRevenue.toLocaleString()} ₫</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-gray-400 font-bold mb-2 text-xs uppercase tracking-wider">Tổng Đơn Hàng</h3>
          <p className="text-3xl font-black text-blue-400">{orders.length}</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-gray-400 font-bold mb-2 text-xs uppercase tracking-wider">Tổng Khách Hàng</h3>
          <p className="text-3xl font-black text-green-400">{users.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/5 rounded-2xl shadow-lg p-6">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wide">Doanh thu 7 ngày gần nhất</h3>
          <div className="h-[250px] w-full">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} tickFormatter={(val) => val.toLocaleString()} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} />
                  <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-500 italic mt-20">Chưa có dữ liệu giao dịch</p>}
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl shadow-lg p-6 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Trạng thái đơn hàng</h3>
          <div className="flex-1 min-h-[250px]">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {orderStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-500 italic mt-20">Chưa có đơn hàng</p>}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {orderStatusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/5 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white uppercase tracking-wide">Top Khách Hàng</h3></div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs">
              <tr><th className="p-4 font-medium">Khách hàng</th><th className="p-4 font-medium text-center">Đơn</th><th className="p-4 font-medium text-right">Chi tiêu</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topUsersList.map((u, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td className="p-4"><div className="font-bold text-white">{u.name}</div><div className="text-gray-500 text-xs">{u.phone}</div></td>
                  <td className="p-4 text-center text-gray-300">{u.orderCount}</td>
                  <td className="p-4 text-right font-bold text-orange-500">{u.totalSpent.toLocaleString()} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white uppercase tracking-wide">Món Bán Chạy Nhất</h3></div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs">
              <tr><th className="p-4 font-medium">Sản phẩm</th><th className="p-4 font-medium text-center">Đã bán</th><th className="p-4 font-medium text-right">Doanh thu</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topProductsList.map((p, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td className="p-4 font-bold text-white truncate max-w-[150px]">{p.name}</td>
                  <td className="p-4 text-center text-gray-300">{p.quantity}</td>
                  <td className="p-4 text-right font-bold text-orange-500">{p.revenue.toLocaleString()} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}