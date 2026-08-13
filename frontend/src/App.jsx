
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios
      .get("https://ahadu-shop.onrender.com/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
      });
  }, []);

  const addToCart = (product) => {
    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const increaseQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // AddisPay checkout
  const checkout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const email = prompt("Enter your email:");
    const firstName = prompt("Enter your first name:");
    const lastName = prompt("Enter your last name:");
    const phone = prompt("Enter your phone number:");

    if (!email || !firstName || !lastName || !phone) {
      alert("Please provide all payment information.");
      return;
    }

    try {
      const response = await axios.post(
        "https://ahadu-shop.onrender.com/api/payment/create",
        {
          amount: total,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phone: phone
        }
      );

      const data = response.data;

      console.log("AddisPay response:", data);

      if (data.status_code === 900) {
        if (!data.checkout_url || !data.uuid) {
          console.error("Missing checkout information:", data);
          alert("AddisPay did not return checkout information.");
          return;
        }

        const checkoutUrl =
          `${data.checkout_url}/${data.uuid}`;

        console.log("Redirecting to:", checkoutUrl);

        window.location.href = checkoutUrl;
      } else {
        alert(
          data.message || "Payment creation failed."
        );
      }
    } catch (error) {
      console.error(
        "Payment error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Unable to create payment."
      );
    }
  };

  return (
    <div className="app">

      <header className="header">
        <div className="logo">
          Shop<span>Easy</span>
        </div>

        <div className="cart-icon">
          🛒 Cart ({cartItems})
        </div>
      </header>

      <section className="hero">
        <div>
          <h1>Everything You Need</h1>
          <p>
            Shop your favorite products at great prices.
          </p>

          <button>Shop Now</button>
        </div>
      </section>

      <main className="container">

        <section className="products-section">
          <h2>Products</h2>

          <div className="products">

            {products.map((product) => (
              <div
                className="product-card"
                key={product.id}
              >

                <img
                  src={product.image}
                  alt={product.name}
                />

                <div className="product-info">

                  <h3>{product.name}</h3>

                  <p className="price">
                    {product.price.toLocaleString()} ETB
                  </p>

                  <button
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>

                </div>

              </div>
            ))}

          </div>
        </section>

        <aside className="cart">

          <h2>Shopping Cart</h2>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <div>🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items">

                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="cart-details">

                      <h4>{item.name}</h4>

                      <p>
                        {item.price.toLocaleString()} ETB
                      </p>

                      <div className="quantity">

                        <button
                          onClick={() =>
                            decreaseQuantity(item.id)
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            increaseQuantity(item.id)
                          }
                        >
                          +
                        </button>

                      </div>

                      <button
                        className="remove"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                ))}

              </div>

              <div className="cart-total">

                <div>
                  <span>Total</span>

                  <strong>
                    {total.toLocaleString()} ETB
                  </strong>
                </div>

                <button
                  className="checkout"
                  onClick={checkout}
                >
                  Checkout
                </button>

              </div>
            </>
          )}

        </aside>

      </main>

      <footer>
        <p>
          © 2026 ShopEasy. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default App;

