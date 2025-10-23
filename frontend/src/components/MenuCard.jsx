import React from 'react';

const MenuCard = ({ item, onAddToCart }) => {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">{item.name}</h5>
        <p className="card-text">{item.description}</p>
        <p className="card-text">Price: ${item.price}</p>
        <p className="card-text">Available: <span className={item.isAvailable ? 'text-success' : 'text-danger'}>{item.isAvailable ? 'Yes' : 'No'}</span></p>
        <button onClick={() => onAddToCart(item)} disabled={!item.isAvailable} className="btn btn-primary">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default MenuCard;
