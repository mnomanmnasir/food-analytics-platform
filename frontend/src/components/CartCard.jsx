import React from 'react';

const CartCard = ({ cart, totalAmount, onRemoveFromCart, onPlaceOrder }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">🛒 Your Cart</h5>
      </div>
      <div className="card-body">
        <div className="list-group list-group-flush">
          {cart.length === 0 ? <div className="text-muted">Your cart is empty</div> : 
            cart.map(item => (
              <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => onRemoveFromCart(item.id)} className="btn btn-sm btn-danger">Remove</button>
              </div>
            ))
          }
        </div>
        {cart.length > 0 && (
          <div className="card-footer">
            <div className="d-flex justify-content-between align-items-center">
              <strong>Total Amount: ${totalAmount.toFixed(2)}</strong>
            </div>
            <form onSubmit={onPlaceOrder} className="mt-3">
              {/* <div className="mb-3">
                <input type="number" name="userId" placeholder="User ID" required className="form-control" />
              </div> */}
              <div className="mb-3">
                <input type="text" name="deliveryAddress" placeholder="Delivery Address" required className="form-control" />
              </div>
              <div className="mb-3">
                <input type="tel" name="phoneNumber" placeholder="Phone Number" required className="form-control" />
              </div>
              <div className="mb-3">
                <select name="paymentMethod" required className="form-select">
                  <option value="">-- Payment Method --</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div className="mb-3">
                <textarea name="notes" placeholder="Notes" className="form-control"></textarea>
              </div>
              <button type="submit" className="btn btn-success">Place Order</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartCard;
