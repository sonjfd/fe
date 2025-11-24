import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {fetchDashboardStats} from "@/api/dashboard.api";
import type {IDashboardStats} from "@/types/dashboard";
import {formatVND} from "@/utils/number";
import {FaShoppingBag,FaUsers,FaBoxOpen,FaMoneyBillWave} from "react-icons/fa";
import CenterSpinner from "@/components/CustomLoading";
import {
    LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,
    BarChart,Bar,Legend,PieChart,Pie,Cell
} from "recharts";

const PIE_COLOR = ["#0088FE","#00C49F","#FFBB28","#FF8042","#8884D8"]

export default function Dashboard() {
    const [stats, setStats] = useState<IDashboardStats | null > (null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            try{
                const data = await fetchDashboardStats();
                if (data){
                    setStats(data);
                }
            } catch (error : any){
                console.error(error);
                toast.error("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    if (loading) return <CenterSpinner />;

    const StatCard = ({
                          title,
                          value,
                          icon,
                          colorClass,
                      } : {
        title: string;
        value: string | number;
        icon: React.ReactNode;
        colorClass: string;
    }) => (
        <div className= "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
                <p className= "text-sm font-medium text-neutral-500">{title}</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-800">{value}</h3>
            </div>
            <div className={`rounded-full p-3 text-white ${colorClass}`}>{icon}</div>
        </div>
    );

    const renderStatus = (status: string) => {
        let color = "bg-neutral-100 text-neutral-700";
        if (status === "NEW" || status === "PENDING") color = "bg-blue-100 text-blue-700";
        if (status === "CONFIRMED" || status === "SHIPPING") color = "bg-yellow-100 text-yellow-800";
        if (status === "DELIVERED" || status === "PAID") color = "bg-green-100 text-green-700";
        if (status === "CANCELED") color = "bg-red-100 text-red-700";

        return (
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${color}`}>
                {status}
            </span>
        );
    };
    return (
        <div className= "space-y-6">
            <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
            {/*Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard title="Tổng doanh thu"
                          value={stats ? formatVND(stats.totalRevenue) : "0 đ"}
                          icon={<FaMoneyBillWave size={20}/>}
                          colorClass= "bg-emerald-500"
                />
                <StatCard title="Tổng đơn hàng"
                          value={stats?.totalOrders ?? 0}
                          icon={<FaShoppingBag size={20}/>}
                          colorClass="bg-blue-500"
                />
                <StatCard title="Sản phẩm"
                          value={stats?.totalProducts ?? 0}
                          icon={<FaBoxOpen size={20}/>}
                          colorClass="bg-orange-500"
                />
                <StatCard title="Khách hàng"
                          value={stats?.totalUsers ?? 0}
                          icon={<FaUsers size={20}/>}
                          colorClass="bg-purple-500"
                />
            </div>

            {/*Phần Charts*/}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/*Doanh thu */}
                <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">Doanh thu theo tháng</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.monthlyRevenue || []} margin={{top: 5, right: 20, bottom: 5, left: 0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                                <XAxis dataKey="month" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} dy={10}
                                />
                                <YAxis tickFormatter={(value) => `${value / 1000000}M`} tick = {{fill: '#6b7380', fontSize: 12}} tickLine={false} axisLine={false}
                                />
                                <Tooltip
                                    formatter={(value: number) => [formatVND(value), "Doanh thu"]}
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                />
                                <Legend wrapperStyle={{paddingTop: '20px'}}/>
                                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff"}} activeDot={{r: 7, strokeWidth: 0}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/*Top sản phẩm */}
                <div className="lg:col-span-1 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">Top 5 sản phẩm bán chạy</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={stats?.topProducts || []} margin={{top: 0, right: 30, left:0, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb"/>
                                <XAxis type= "number" hide/>
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#4b5563'}} tickLine={false} axisLine={false}/>
                                <Tooltip
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                />
                                <Bar dataKey="sold" name= "Số lượng bán" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {
                                        (stats?.topProducts || []).map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLOR[index % PIE_COLOR.length]}/>
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {/*Category & Recent Orders*/}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">Phân bố doanh mục</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={(stats?.categoryShare || []) as any[]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="productCount" nameKey="name">
                                    {(stats?.categoryShare || []).map((_entry,index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLOR[index % PIE_COLOR.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize:'12px', paddingTop:'10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/*Bảng Đơn Hàng*/}

            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-neutral-800">Đơn hàng</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className= "bg-neutral-50 text-neutral-600 uppercase text-xs font-semibold">
                        <tr>
                            <th className= "px-6 py-3">Mã đơn</th>
                            <th className= "px-6 py-3">Khách hàng</th>
                            <th className= "px-6 py-3">Tổng tiền</th>
                            <th className= "px-6 py-3">Ngày tạo</th>
                            <th className= "px-6 py-3">Trạng thái</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-200">
                        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                            stats.recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                                    <td className="px-6 py-4">{order.customerName}</td>
                                    <td className="px-6 py-4 font-semibold text-indigo-600">
                                        {formatVND(order.totalPrice)}
                                    </td>
                                    <td className="px-6 py-4"> {new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                                    <td className="px-6 py-4">{renderStatus(order.status)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Chưa có đơn hàng nào</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
}