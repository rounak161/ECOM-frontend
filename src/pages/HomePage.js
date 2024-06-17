import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/Homepage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch all products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching products:", error);
    }
  };

  // Fetch total count of products
  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      setTotal(data?.total);
    } catch (error) {
      console.error("Error fetching total count:", error);
    }
  };

  // Load more products
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setProducts([...products, ...data?.products]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error loading more products:", error);
    }
  };

  // Handle category filter change
  const handleFilter = (value, id) => {
    if (value) {
      setChecked([...checked, id]);
    } else {
      setChecked(checked.filter((c) => c !== id));
    }
  };

  // Handle price filter change
  const handlePriceFilter = (e) => {
    setRadio(e.target.value);
  };

  // Apply filters and fetch filtered products
  useEffect(() => {
    if (!checked.length && !radio) {
      getAllProducts();
    } else {
      filterProduct();
    }
  }, [checked, radio, page]);

  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products);
    } catch (error) {
      console.error("Error filtering products:", error);
    }
  };

  // Render product cards
  const renderProducts = () => {
    return products.map((p) => (
      <div className="card m-2" key={p._id}>
        <img
          src={`/api/v1/product/product-photo/${p._id}`}
          className="card-img-top"
          alt={p.name}
        />
        <div className="card-body">
          <div className="card-name-price">
            <h5 className="card-title">{p.name}</h5>
            <h5 className="card-title card-price">
              {p.price.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </h5>
          </div>
          <p className="card-text">{p.description.substring(0, 60)}...</p>
          <div className="card-name-price">
            <button
              className="btn btn-info ms-1"
              onClick={() => navigate(`/product/${p.slug}`)}
            >
              More Details
            </button>
            <button
              className="btn btn-dark ms-1"
              onClick={() => {
                setCart([...cart, p]);
                localStorage.setItem("cart", JSON.stringify([...cart, p]));
                toast.success("Item Added to cart");
              }}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Layout title={"All Products - Best Offers"}>
      {/* Banner image */}
      <img
        src="/images/banner.png"
        className="banner-img"
        alt="bannerimage"
        width={"100%"}
      />
      {/* Filter and products section */}
      <div className="container-fluid row mt-3 home-page">
        {/* Filters */}
        <div className="col-md-3 filters">
          <h4 className="text-center">Filter By Category</h4>
          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox
                key={c._id}
                onChange={(e) => handleFilter(e.target.checked, c._id)}
              >
                {c.name}
              </Checkbox>
            ))}
          </div>
          {/* Price filter */}
          <h4 className="text-center mt-4">Filter By Price</h4>
          <div className="d-flex flex-column">
            <Radio.Group onChange={handlePriceFilter}>
              {Prices?.map((p) => (
                <div key={p._id}>
                  <Radio value={p.array}>{p.name}</Radio>
                </div>
              ))}
            </Radio.Group>
          </div>
          {/* Reset filters button */}
          <div className="d-flex flex-column">
            <button
              className="btn btn-danger"
              onClick={() => {
                setChecked([]);
                setRadio("");
                getAllProducts(); // Fetch all products after reset
              }}
            >
              RESET FILTERS
            </button>
          </div>
        </div>
        {/* Products */}
        <div className="col-md-9">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {renderProducts()}
          </div>
          {/* Load more button */}
          <div className="m-2 p-3">
            {products && products.length < total && (
              <button
                className="btn loadmore"
                onClick={() => setPage(page + 1)}
              >
                {loading ? "Loading ..." : "Load More"}
                <AiOutlineReload />
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
