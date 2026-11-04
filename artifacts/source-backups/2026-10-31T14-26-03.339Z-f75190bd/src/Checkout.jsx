import React, { useState } from "react";
import { money } from "./products.js";
export default function Checkout({ cart, total, onOrder }) {
  const [errors, setErrors] = useState({});
  function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = {};
    for (const name of ["name", "email", "address", "city", "postcode"])
      if (!String(data.get(name) || "").trim())
        next[name] = "This field is required.";
    if (
      data.get("email") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.get("email"))
    )
      next.email = "Enter a valid email address.";
    if (data.get("postcode") && !/^\d{6}$/.test(data.get("postcode")))
      next.postcode = "Enter a six-digit Indian PIN code.";
    setErrors(next);
    if (Object.keys(next).length) {
      setTimeout(
        () => document.getElementById(Object.keys(next)[0])?.focus(),
        0,
      );
      return;
    }
    if (cart.length) onOrder();
  }
  return (
    <section className="checkout">
      <p className="eyebrow">ONE LAST STEP</p>
      <h1>Demo checkout</h1>
      <p>
        This simulates an order. Use fictional details. Nothing is sent to a
        server and no payment is collected.
      </p>
      {!cart.length ? (
        <div className="empty">
          <h2>Your bag is empty</h2>
          <a href="#shop">Browse products</a>
        </div>
      ) : (
        <form noValidate onSubmit={submit}>
          <h2>Delivery details</h2>
          {[
            ["name", "Full name", "text"],
            ["email", "Email address", "email"],
            ["address", "Street address", "text"],
            ["city", "City", "text"],
            ["postcode", "PIN code", "text"],
          ].map(([name, label, type]) => (
            <div className="field" key={name}>
              <label htmlFor={name}>{label}</label>
              <input
                id={name}
                name={name}
                type={type}
                autoComplete="off"
                aria-required="true"
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              />
              {errors[name] && (
                <span className="error" id={`${name}-error`} role="alert">
                  {errors[name]}
                </span>
              )}
            </div>
          ))}
          <div className="checkout-total">
            Demo total <strong>{money(total)}</strong>
          </div>
          <button className="button wide" type="submit">
            Place simulated order
          </button>
        </form>
      )}
    </section>
  );
}
