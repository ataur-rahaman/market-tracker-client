import React, { useMemo } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FaBoxOpen, FaCheckCircle, FaClock, FaPlus, FaStore, FaChartLine, FaMapMarkerAlt } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import LoadingSpinner from "../../components/LoadingSpinner";

/** Tiny inline sparkline without any chart library */
const Sparkline = ({ data = [], width = 120, height = 36, strokeWidth = 2 }) => {
  if (!data.length) {
    return <div className="text-xs text-gray-400">no data</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / Math.max(1, data.length - 1);

  const points = data.map((val, i) => {
    const x = i * stepX;
    // invert y so higher price is higher visually
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });

  const path = `M ${points.join(" L ")}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
};

const VendorHomePage = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["vendorProducts", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosPublic.get(`/products/vendor/${encodeURIComponent(user.email.toLowerCase())}`);
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const {
    totalProducts,
    pendingCount,
    approvedCount,
    markets,
    lastUpdatedAt,
    recentUpdates,
  } = useMemo(() => {
    const total = products.length;

    const pending = products.filter(p => (p.status || "pending") === "pending").length;
    const approved = products.filter(p => (p.status || "pending") === "approved").length;

    const marketSet = new Set(products.map(p => (p.market_name || "").trim()).filter(Boolean));

    // Last updated at = latest date inside any prices array
    let latest = null;
    products.forEach(p => {
      (p.prices || []).forEach(pr => {
        if (pr?.date) {
          const d = new Date(pr.date);
          if (!latest || d > latest) latest = d;
        }
      });
    });

    // Build recent updates table (flatten)
    const updates = [];
    products.forEach(p => {
      const arr = (p.prices || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      if (arr.length) {
        updates.push({
          _id: p._id,
          item_name: p.item_name,
          market_name: p.market_name,
          latest: arr[0],                       // { date, price }
          last7: arr.slice(0, 7).reverse(),     // oldest→latest for small sparkline
          image_url: p.image_url,
          status: p.status || "pending",
        });
      }
    });
    // Sort by most recent date
    updates.sort((a, b) => new Date(b.latest.date) - new Date(a.latest.date));

    return {
      totalProducts: total,
      pendingCount: pending,
      approvedCount: approved,
      markets: Array.from(marketSet),
      lastUpdatedAt: latest,
      recentUpdates: updates.slice(0, 6), // top 6 rows
    };
  }, [products]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Failed to load your dashboard. Please try again.</span>
        </div>
      </div>
    );
  }

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Vendor";

  return (
    <div className="max-w-6xl mx-auto p-0 md:p-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName} 👋</h1>
          <p className="text-sm md:text-base text-gray-500">
            Track your products, submit price updates, and monitor market trends.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/vendor/add-product" className="btn btn-primary">
            <FaPlus /> Add Product
          </Link>
          <Link to="/dashboard/vendor/my-products" className="btn btn-outline">
            <FaBoxOpen /> Manage Products
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <FaBoxOpen size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold">{totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10 text-warning">
                <FaClock size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-semibold">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10 text-success">
                <FaCheckCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-semibold">{approvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/10 text-info">
                <FaMapMarkerAlt size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Markets Covered</p>
                <p className="text-2xl font-semibold">{markets.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="alert bg-base-100 shadow">
        <FaChartLine />
        <div>
          <h3 className="font-semibold">Data freshness</h3>
          <div className="text-sm text-gray-500">
            {lastUpdatedAt
              ? <>Last price update on <span className="font-medium">{new Date(lastUpdatedAt).toLocaleDateString()}</span>.</>
              : "No price updates recorded yet."}
          </div>
        </div>
      </div>

      {/* Markets overview */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title"><FaStore /> Your Markets</h2>
          {markets.length ? (
            <div className="flex flex-wrap gap-2">
              {markets.map((mkt, idx) => (
                <span key={idx} className="badge badge-outline">{mkt}</span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No markets yet. Add your first product to get started.</p>
          )}
        </div>
      </div>

      {/* Recent updates table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body overflow-x-auto">
          <div className="flex items-center justify-between">
            <h2 className="card-title"><FaChartLine /> Recent Price Updates</h2>
            <Link to="/dashboard/vendor/my-products" className="btn btn-sm btn-outline">View All</Link>
          </div>

          {!recentUpdates.length ? (
            <div className="py-10 text-center text-gray-500">
              No updates yet. Click <span className="font-medium">Add Product</span> to create one.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="hidden md:table-cell">Market</th>
                  <th>Status</th>
                  <th>Latest (৳)</th>
                  <th className="hidden md:table-cell">Trend</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentUpdates.map(row => {
                  const trendData = row.last7.map(x => Number(x.price)).filter(n => !Number.isNaN(n));
                  return (
                    <tr key={row._id}>
                      <td className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10">
                            <img src={row.image_url} alt={row.item_name} />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{row.item_name}</div>
                          <div className="text-xs text-gray-500">{row.market_name}</div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">{row.market_name}</td>
                      <td>
                        <span
                          className={
                            "badge " +
                            (row.status === "approved"
                              ? "badge-success"
                              : row.status === "pending"
                              ? "badge-warning"
                              : "badge-ghost")
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="font-medium">৳{Number(row.latest.price).toFixed(2)}</td>
                      <td className="hidden md:table-cell text-info">
                        <Sparkline data={trendData} />
                      </td>
                      <td>{new Date(row.latest.date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Help / Tips */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Tips to keep data high-quality</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Submit price updates daily (preferably before 10am).</li>
              <li>Use clear product names (e.g., <em>Onion (Local)</em> vs <em>Onion (Imported)</em>).</li>
              <li>Add short notes in “Item Description” about freshness/grade.</li>
              <li>Upload a clear product image for better trust.</li>
            </ul>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Link to="/dashboard/vendor/add-product" className="btn btn-sm btn-primary"><FaPlus /> Add Product</Link>
              <Link to="/dashboard/vendor/my-products" className="btn btn-sm btn-outline"><FaBoxOpen /> Manage Products</Link>
              <Link to="/all-products" className="btn btn-sm btn-outline"><FaChartLine /> View Public Prices</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorHomePage;
