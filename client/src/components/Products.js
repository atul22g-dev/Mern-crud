import React, { useEffect, useState, useCallback } from "react";
import { getProducts, updateProduct, deleteProduct as apiDeleteProduct } from "../api";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Edit
  const handleSaveEdit = async (id, { name, price }) => {
    await updateProduct(id, { name, price });
    fetchProducts();
  };

  // Delete
  const handleConfirmDelete = async (id) => {
    await apiDeleteProduct(id);
    fetchProducts();
  };

  return (
    <section className="products-section">
      <div className="products-header">
        <h1>My Products</h1>
        <p>Manage and organize your product catalog</p>
      </div>

      {loading ? (
        <div className="products-grid">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p style={{ color: "var(--text-secondary)" }}>Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="products-grid">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Failed to load products</h3>
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchProducts}>
              Retry
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="products-grid">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No products yet</h3>
            <p>Create your first product to get started</p>
          </div>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product, index) => (
            <div
              key={product._id}
              className="glass-card product-card"
              style={{
                animation: `fadeInUp 0.5s ease-out forwards`,
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div className="product-card-header">
                <div className="product-icon">🏷️</div>
                <div className="product-actions">
                  <button
                    className="btn btn-icon c-pointer"
                    onClick={() => setEditProduct(product)}
                    title="Edit product"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-icon delete c-pointer"
                    onClick={() => setDeleteTarget(product)}
                    title="Delete product"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="product-name">{product.name}</div>
              <div className="product-price">₹{product.price}</div>
              <div className="product-card-footer">
                <span>ID: {product._id.slice(-6).toUpperCase()}</span>
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Modal */}
      <DeleteModal
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
};

export default Products;
