import React, { useState } from "react";
import { createProduct } from "../api";

const Form = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      await createProduct({ name, price });
      setName("");
      setPrice("");
      alert("Product created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-section">
      <div className="form-card glass-card">
        <div style={{ marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "2rem" }}>✨</span>
        </div>
        <h1 className="form-title">Post Data</h1>
        <p className="form-subtitle">Create a new product entry in your catalog</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="productName">Product Name</label>
            <input
              type="text"
              className="form-control"
              id="productName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter the product name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="productPrice">Product Price</label>
            <input
              type="number"
              className="form-control"
              id="productPrice"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter the price (e.g. 29.99)"
              step="0.01"
              min="0"
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          >
            {submitting ? (
              <>
                <span className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                Creating...
              </>
            ) : (
              <>
                <span>🚀</span> Create Product
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Form;
