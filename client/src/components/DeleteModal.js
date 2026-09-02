import React, { useState, useEffect, useRef, useCallback } from "react";

const DeleteModal = ({ product, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const dialogRef = useRef(null);

  const isOpen = Boolean(product);

  // Sync dialog open/close with product prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(product._id);
      dialogRef.current?.close();
    } catch {
      // error handled by parent
    } finally {
      setDeleting(false);
    }
  };

  // Prevent close during delete
  const handleDialogCancel = (e) => {
    if (deleting) e.preventDefault();
  };

  if (!product) return null;

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog"
      onCancel={handleDialogCancel}
      aria-labelledby="delete-modal-title"
    >
      <div className="modal-card glass-card modal-card--danger" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon-danger">🗑️</div>
          <div>
            <h2 className="modal-title" id="delete-modal-title">Delete Product</h2>
            <p className="modal-subtitle">This action cannot be undone</p>
          </div>
          <button className="modal-close" onClick={() => dialogRef.current?.close()} title="Close">
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
            onClick={() => dialogRef.current?.close()}
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
    </dialog>
  );
};

export default DeleteModal;
