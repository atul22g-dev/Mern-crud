import React, { useState, useEffect, useRef, useCallback } from "react";

const EditModal = ({ product, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);

  const isOpen = Boolean(product);

  // Sync dialog open/close with product prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }
  }, [isOpen]);

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price || "");
    }
  }, [product]);

  // Focus name input after dialog opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle native dialog close/cancel events
  const handleDialogClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.addEventListener("close", handleDialogClose);
    dialog.addEventListener("cancel", handleDialogClose);
    return () => {
      dialog.removeEventListener("close", handleDialogClose);
      dialog.removeEventListener("cancel", handleDialogClose);
    };
  }, [handleDialogClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price.toString().trim()) return;

    setSaving(true);
    try {
      await onSave(product._id, { name, price });
      dialogRef.current?.close();
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  // Prevent close during save
  const handleDialogCancel = (e) => {
    if (saving) e.preventDefault();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog"
      onCancel={handleDialogCancel}
      aria-labelledby="edit-modal-title"
    >
      <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="edit-modal-title">Edit Product</h2>
            <p className="modal-subtitle">Update the product details below</p>
          </div>
          <button className="modal-close" onClick={() => dialogRef.current?.close()} title="Close">
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
              onClick={() => dialogRef.current?.close()}
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
    </dialog>
  );
};

export default EditModal;
