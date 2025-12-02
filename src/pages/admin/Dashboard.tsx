import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { fetchDashboardStats } from "@/api/admin.dashboard.api.ts";
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

  // filter năm cho biểu đồ tháng
  const [selectedYear, setSelectedYear] = useState<string>("all");

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

  // ====== DERIVED DATA FOR CHARTS ======

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

  // Biểu đồ doanh thu theo sản phẩm (dùng topProducts)
  const topProductRevenueData = useMemo(() => {
    if (!stats?.topProducts) return [];
    return stats.topProducts.map((p) => ({
      name: p.name,
      revenue: p.revenue,
      sold: p.sold,
    }));
  }, [stats]);

  // Lấy list năm từ monthlyRevenue
  const yearOptions = useMemo(() => {
    if (!stats?.monthlyRevenue) return [];
    const set = new Set<string>();
    stats.monthlyRevenue.forEach((m) => {
      const parts = m.month.split("/");
      if (parts.length === 2) set.add(parts[1]);
    });
    return Array.from(set.values());
  }, [stats]);

  // Dữ liệu doanh thu theo tháng sau khi filter theo năm
  const monthlyRevenueData = useMemo(() => {
    const arr = stats?.monthlyRevenue || [];
    if (selectedYear === "all") return arr;
    return arr.filter((m) => m.month.endsWith(`/${selectedYear}`));
  }, [stats, selectedYear]);

  if (loading) return <CenterSpinner />;

  const StatCard = ({
    title,
    value,
    icon,
    colorClass,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
  }) => (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-neutral-800">{value}</h3>
      </div>
      <div className={`rounded-full p-3 text-white ${colorClass}`}>{icon}</div>
    </div>
  );

  const hasMonthlyRevenue = monthlyRevenueData.length > 0;
  const hasTopProducts = (stats?.topProducts || []).length > 0;
  const hasOrderStatus = orderStatusData.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng doanh thu"
          value={stats ? formatVND(stats.totalRevenue) : "0 đ"}
          icon={<FaMoneyBillWave size={20} />}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={stats?.totalOrders ?? 0}
          icon={<FaShoppingBag size={20} />}
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Sản phẩm"
          value={stats?.totalProducts ?? 0}
          icon={<FaBoxOpen size={20} />}
          colorClass="bg-orange-500"
        />
        <StatCard
          title="Khách hàng"
          value={stats?.totalUsers ?? 0}
          icon={<FaUsers size={20} />}
          colorClass="bg-purple-500"
        />
      </div>

      {/* Row 1: Doanh thu theo tháng (Bar chart + filter năm) + Top sản phẩm (SL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo tháng */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">
              Doanh thu theo tháng
            </h3>
            {yearOptions.length > 0 && (
              <select
                className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700 outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">Tất cả năm</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="h-[300px] w-full">
            {hasMonthlyRevenue ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyRevenueData}
                  margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value / 1000000}M`}
                    tick={{ fill: "#6b7380", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatVND(value),
                      "Doanh thu",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow:
                        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "16px" }} />
                  <Bar dataKey="revenue" name="Doanh thu" radius={[4, 4, 0, 0]}>
                    {monthlyRevenueData.map((_entry, index) => (
                      <Cell
                        key={`cell-month-${index}`}
                        fill={PIE_COLOR[index % PIE_COLOR.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                Không có dữ liệu doanh thu
              </div>
            )}
          </div>
        </div>

        {/* Top sản phẩm bán chạy (số lượng) */}
        <div className="lg:col-span-1 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-800">
            Top 5 sản phẩm bán chạy (SL)
          </h3>
          <div className="h-[300px] w-full">
            {hasTopProducts ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={stats?.topProducts || []}
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow:
                        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [value, "Số lượng bán"]}
                  />
                  <Bar
                    dataKey="sold"
                    name="Số lượng bán"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  >
                    {(stats?.topProducts || []).map((_entry, index) => (
                      <Cell
                        key={`cell-sold-${index}`}
                        fill={PIE_COLOR[index % PIE_COLOR.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                Không có dữ liệu sản phẩm
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Doanh thu theo sản phẩm + Category share + Order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo sản phẩm */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-800">
            Doanh thu theo sản phẩm
          </h3>
          <div className="h-[300px] w-full">
            {hasTopProducts ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductRevenueData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#4b5563" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tickFormatter={(value) => `${value / 1000000}M`}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow:
                        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [
                      formatVND(value),
                      "Doanh thu",
                    ]}
                  />
                  <Bar dataKey="revenue" name="Doanh thu" radius={[4, 4, 0, 0]}>
                    {topProductRevenueData.map((_entry, index) => (
                      <Cell
                        key={`cell-rev-${index}`}
                        fill={PIE_COLOR[index % PIE_COLOR.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                Không có dữ liệu sản phẩm
              </div>
            )}
          </div>
        </div>

        {/* Order status pie */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-800">
            Trạng thái đơn hàng
          </h3>
          <div className="h-[300px] w-full">
            {hasOrderStatus ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {orderStatusData.map((_entry, index) => (
                      <Cell
                        key={`cell-status-${index}`}
                        fill={PIE_COLOR[index % PIE_COLOR.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                Không có dữ liệu đơn hàng
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TODO: Bảng đơn hàng gần đây nếu muốn thêm */}
    </div>
  );
}
