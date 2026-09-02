import React, { useState, useEffect, useRef } from "react";

const EditModal = ({ product, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price || "");
    }
  }, [product]);

  // Focus the name input after mount (replaces autoFocus for accessibility)
  useEffect(() => {
    if (product && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [product]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price.toString().trim()) return;

    setSaving(true);
    try {
      await onSave(product._id, { name, price });
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="edit-modal-title">Edit Product</h2>
            <p className="modal-subtitle">Update the product details below</p>
          </div>
          <button className="modal-close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-name">Product Name</label>
            <input
              type="text"
              className="form-control"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              ref={nameInputRef}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-price">Product Price</label>
            <input
              type="number"
              className="form-control"
              id="edit-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              step="0.01"
              min="0"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving || !name.trim() || !price.toString().trim()}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
