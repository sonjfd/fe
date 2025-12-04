import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { fetchDashboardStats } from "@/api/admin.dashboard.api";
import type { IDashboardStats } from "@/types/dashboard";
import { formatVND } from "@/utils/number";
import {
  FaShoppingBag,
  FaUsers,
  FaBoxOpen,
  FaMoneyBillWave,
} from "react-icons/fa";
import CenterSpinner from "@/components/CustomLoading";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLOR = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Dashboard() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter state
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardStats();
        if (data) {
          setStats(data);
        }
      } catch (error: any) {
        console.error(error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ====== 1. LOGIC XỬ LÝ BIỂU ĐỒ DOANH THU (THEO YÊU CẦU CỦA BẠN) ======
  
  // A. Lấy danh sách Năm có trong dữ liệu để nạp vào Select Box
  const yearOptions = useMemo(() => {
    if (!stats?.monthlyRevenue) return [];
    const set = new Set<string>();
    stats.monthlyRevenue.forEach((item) => {
      // item.date format: "YYYY-MM-DD"
      if (item.date) {
        const y = item.date.split("-")[0];
        set.add(y);
      }
    });
    // Sắp xếp năm giảm dần
    return Array.from(set.values()).sort((a, b) => Number(b) - Number(a));
  }, [stats]);

  // B. Xử lý dữ liệu hiển thị lên biểu đồ
  const revenueChartData = useMemo(() => {
    if (!stats?.monthlyRevenue) return [];

    // --- TRƯỜNG HỢP 1: CHƯA CHỌN NĂM (HIỆN TẤT CẢ CÁC NĂM) ---
    if (selectedYear === "all") {
      const map = new Map<string, number>();
      
      stats.monthlyRevenue.forEach(item => {
        const year = item.date.split("-")[0]; // Lấy năm "2024"
        const currentTotal = map.get(year) || 0;
        map.set(year, currentTotal + item.revenue);
      });

      // Chuyển Map thành Array và sắp xếp theo năm tăng dần
      return Array.from(map.entries())
        .map(([year, revenue]) => ({ name: `Năm ${year}`, revenue }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    // --- TRƯỜNG HỢP 2: ĐÃ CHỌN NĂM - NHƯNG CHƯA CHỌN THÁNG (HIỆN 12 THÁNG) ---
    if (selectedMonth === "all") {
      // Tạo khung 12 tháng mặc định
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        name: `Tháng ${i + 1}`,
        revenue: 0,
      }));

      stats.monthlyRevenue.forEach((item) => {
        const [y, m] = item.date.split("-");
        // Chỉ lấy dữ liệu của năm đang chọn
        if (y === selectedYear) {
          const monthIndex = parseInt(m) - 1; // Tháng 1 là index 0
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex].revenue += item.revenue;
          }
        }
      });
      return monthlyData;
    }

    // --- TRƯỜNG HỢP 3: ĐÃ CHỌN NĂM VÀ CHỌN THÁNG (HIỆN TỪNG NGÀY) ---
    const yearNum = parseInt(selectedYear);
    const monthNum = parseInt(selectedMonth);
    
    // Tính số ngày trong tháng đó (để render trục X cho đủ ngày)
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    
    // Tạo khung các ngày (mặc định revenue = 0)
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      name: `${i + 1}`, // Label hiển thị: 1, 2, 3...
      fullDate: `${i + 1}/${monthNum}/${yearNum}`, // Dùng cho tooltip
      revenue: 0,
    }));

    stats.monthlyRevenue.forEach((item) => {
      const [y, m, d] = item.date.split("-");
      // Khớp cả Năm và Tháng
      if (y === selectedYear && parseInt(m) === monthNum) {
        const dayIndex = parseInt(d) - 1;
        if (dayIndex >= 0 && dayIndex < daysInMonth) {
          dailyData[dayIndex].revenue += item.revenue;
        }
      }
    });

    return dailyData;

  }, [stats, selectedYear, selectedMonth]);


  // ====== CÁC BIỂU ĐỒ KHÁC (GIỮ NGUYÊN NHƯ CŨ) ======

  // Biểu đồ tròn trạng thái đơn hàng
  const orderStatusData = useMemo(() => {
    if (!stats?.recentOrders) return [];
    const map = new Map<string, number>();
    stats.recentOrders.forEach((order) => {
      map.set(order.status, (map.get(order.status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [stats]);

  // Biểu đồ doanh thu theo sản phẩm (Top Products)
  const topProductRevenueData = useMemo(() => {
    if (!stats?.topProducts) return [];
    return stats.topProducts.map((p) => ({
      name: p.name,
      revenue: p.revenue,
      sold: p.sold,
    }));
  }, [stats]);

  if (loading) return <CenterSpinner />;

  // Component Card nhỏ
  const StatCard = ({ title, value, icon, colorClass }: any) => (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-neutral-800">{value}</h3>
      </div>
      <div className={`rounded-full p-3 text-white ${colorClass}`}>{icon}</div>
    </div>
  );

  const hasTopProducts = (stats?.topProducts || []).length > 0;
  const hasOrderStatus = orderStatusData.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng doanh thu" value={stats ? formatVND(stats.totalRevenue) : "0 đ"} icon={<FaMoneyBillWave size={20} />} colorClass="bg-emerald-500" />
        <StatCard title="Tổng đơn hàng" value={stats?.totalOrders ?? 0} icon={<FaShoppingBag size={20} />} colorClass="bg-blue-500" />
        <StatCard title="Sản phẩm" value={stats?.totalProducts ?? 0} icon={<FaBoxOpen size={20} />} colorClass="bg-orange-500" />
        <StatCard title="Khách hàng" value={stats?.totalUsers ?? 0} icon={<FaUsers size={20} />} colorClass="bg-purple-500" />
      </div>

      {/* KHU VỰC BIỂU ĐỒ CHÍNH (ĐÃ UPDATE LOGIC) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === BIỂU ĐỒ DOANH THU === */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-neutral-800">
              {selectedYear === "all" 
                ? "Doanh thu các năm" 
                : selectedMonth === "all" 
                  ? `Doanh thu năm ${selectedYear}`
                  : `Doanh thu tháng ${selectedMonth}/${selectedYear}`
              }
            </h3>
            
            {/* Filter Controls */}
            <div className="flex gap-3">
              <select
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedMonth("all"); // Reset tháng khi đổi năm
                }}
              >
                <option value="all">Tất cả năm</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>

              {/* Chỉ hiện chọn tháng khi đã chọn năm cụ thể */}
              {selectedYear !== "all" && (
                <select
                  className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">Cả năm</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#6b7280", fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                  label={
                    selectedYear !== 'all' && selectedMonth !== 'all' 
                    ? { value: 'Ngày', position: 'insideBottom', offset: -5, fontSize: 10, fill: "#9ca3af" } 
                    : undefined
                  }
                />
                <YAxis 
                  tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(0)}M` : `${val}`} 
                  tick={{ fill: "#6b7280", fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(val: number) => [formatVND(val), "Doanh thu"]}
                  labelFormatter={(label, payload) => {
                     // Nếu đang xem ngày, hiển thị ngày đầy đủ trong tooltip
                     if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                        return `Ngày ${payload[0].payload.fullDate}`;
                     }
                     return label;
                  }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar 
                  dataKey="revenue" 
                  name="Doanh thu" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  // Điều chỉnh độ rộng cột cho đẹp tùy theo số lượng cột
                  barSize={selectedYear !== 'all' && selectedMonth !== 'all' ? undefined : 40} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === TOP PRODUCT (GIỮ NGUYÊN) === */}
        <div className="lg:col-span-1 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col">
          <h3 className="mb-4 text-lg font-semibold text-neutral-800">Top 5 bán chạy (SL)</h3>
          <div className="flex-1 min-h-[300px]">
             {hasTopProducts ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: "#4b5563" }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(val: number) => [val, "Đã bán"]} contentStyle={{borderRadius: '8px'}} />
                  <Bar dataKey="sold" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-neutral-400 text-sm">Chưa có dữ liệu</div>
             )}
          </div>
        </div>
      </div>

      {/* Row 2: Doanh thu SP & Status (GIỮ NGUYÊN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
           <h3 className="mb-4 text-lg font-semibold text-neutral-800">Doanh thu theo Sản phẩm</h3>
           <div className="h-[300px]">
             {hasTopProducts ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductRevenueData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(v)=>`${(v/1000000).toFixed(1)}M`} width={40} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v:number)=>formatVND(v)} contentStyle={{borderRadius: '8px'}} />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#8b5cf6" radius={[4,4,0,0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-neutral-400 text-sm">Chưa có dữ liệu</div>
             )}
           </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
           <h3 className="mb-4 text-lg font-semibold text-neutral-800">Trạng thái đơn hàng</h3>
           <div className="h-[300px]">
             {hasOrderStatus ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={5}>
                     {orderStatusData.map((_, i) => <Cell key={i} fill={PIE_COLOR[i % PIE_COLOR.length]} />)}
                   </Pie>
                   <Tooltip />
                   <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                 </PieChart>
               </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-neutral-400 text-sm">Chưa có đơn hàng</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}