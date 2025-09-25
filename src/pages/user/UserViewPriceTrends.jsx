import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FaLeaf, FaChartLine } from "react-icons/fa";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import LoadingSpinner from "../../components/LoadingSpinner";

const shortDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
};

const trendPercent = (arr, n = 7) => {
  if (!arr?.length) return null;
  const tail = arr.slice(-n);
  const first = tail[0]?.price;
  const last = tail[tail.length - 1]?.price;
  if (typeof first !== "number" || typeof last !== "number" || first === 0) return null;
  const pct = ((last - first) / first) * 100;
  return Number.isFinite(pct) ? pct : null;
};

const UserViewPriceTrends = () => {
  const axiosPublic = useAxiosPublic();

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["priceTrends"],
    queryFn: async () => {
      const res = await axiosPublic.get("/products");
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Prepare sidebar items
  const list = useMemo(() => {
    return (products || [])
      .filter((p) => Array.isArray(p.prices) && p.prices.length)
      .map((p) => ({
        id: p._id,
        name: p.item_name || "Unnamed",
        market: p.market_name || "",
        vendor: p.vendor_email || "",
        image: p.image_url,
        prices: p.prices
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((x) => ({ ...x, price: Number(x.price) })),
      }));
  }, [products]);

  // Selected product id
  const [activeId, setActiveId] = useState(null);

  // Auto-select first product when data arrives
  useEffect(() => {
    if (list.length && !activeId) setActiveId(list[0].id);
  }, [list, activeId]);

  const active = useMemo(
    () => list.find((i) => i.id === activeId),
    [list, activeId]
  );

  const data = active?.prices?.map((p) => ({ ...p, label: shortDate(p.date) })) || [];
  const t7 = trendPercent(data, 7);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Failed to load price trends. Please try again.</span>
        </div>
      </div>
    );

  if (!list.length)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="alert">
          <span>No products with price history found.</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-4">
        <FaChartLine /> View Price Trends
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title mb-2">Tracked Items</h2>
              <ul className="menu">
                {list.map((item) => (
                  <li key={item.id}>
                    <button
                      className={activeId === item.id ? "active" : ""}
                      onClick={() => setActiveId(item.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-6 h-6 rounded bg-base-200 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <span className="text-xs flex items-center justify-center w-full h-full">
                                <FaLeaf />
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.market}</div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Chart + meta */}
        <section className="md:col-span-8 lg:col-span-9">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="card-title flex items-center gap-2">
                    {active?.image ? (
                      <span className="inline-flex items-center justify-center w-6 h-6">
                        <img className="w-6 h-6 rounded" src={active.image} alt={active.name} />
                      </span>
                    ) : (
                      <FaLeaf />
                    )}
                    {active?.name}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {active?.market && <div>{active.market}</div>}
                    {active?.vendor && <div>Vendor: {active.vendor}</div>}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Trend (last 7 points)</div>
                  {t7 == null ? (
                    <div className="text-sm">—</div>
                  ) : t7 >= 0 ? (
                    <div className="text-sm font-semibold text-success">+{t7.toFixed(1)}%</div>
                  ) : (
                    <div className="text-sm font-semibold text-error">{t7.toFixed(1)}%</div>
                  )}
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`৳${Number(value).toFixed(2)}`, "Price"]}
                      labelFormatter={(lab, payload) => {
                        const pt = payload?.[0]?.payload;
                        return pt?.date ? new Date(pt.date).toLocaleDateString() : lab;
                      }}
                    />
                    <Line type="monotone" dataKey="price" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs text-gray-500">
                Tip: Hover points to see exact date & price.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserViewPriceTrends;
