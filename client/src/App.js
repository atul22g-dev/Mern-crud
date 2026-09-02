import "./App.css";
import Nav from "./components/Nav";
import Products from "./components/Products";
import {Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Form from "./components/Form";
function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post" element={<Form />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </>
  );
}

export default App;
