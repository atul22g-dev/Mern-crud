import React, { useState, useEffect } from "react";

const DeleteModal = ({ product, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!product) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(product._id);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal-card glass-card modal-card--danger" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon-danger">🗑️</div>
          <div>
            <h2 className="modal-title" id="delete-modal-title">Delete Product</h2>
            <p className="modal-subtitle">This action cannot be undone</p>
          </div>
          <button className="modal-close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              "{product.name}"
            </strong>
            ? This will permanently remove the product from your catalog.
          </p>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
