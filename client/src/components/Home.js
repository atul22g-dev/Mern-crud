import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="hero-section">
      <div className="hero-decoration hero-decoration-1"></div>
      <div className="hero-decoration hero-decoration-2"></div>
      
      <div className="hero-content">
        <div className="hero-badge">
          ✨ Modern MERN Stack CRUD
        </div>
        
        <h1 className="hero-title">
          Build <span className="gradient-text">Full-Stack Apps</span>
          <br />with Confidence
        </h1>
        
        <p className="hero-description">
          A sleek, modern CRUD application built with MongoDB, Express, React, 
          and Node.js. Create, manage, and organize your products effortlessly.
        </p>
        
        <div className="hero-actions">
          <Link to="/post" className="btn btn-primary">
            <span>🚀</span> Get Started
          </Link>
          <Link to="/products" className="btn btn-outline">
            <span>📦</span> View Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
