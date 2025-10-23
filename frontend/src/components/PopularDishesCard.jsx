import React from 'react';

const PopularDishesCard = ({ dishes }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">🏆 Top 5 Popular Dishes</h5>
      </div>
      <div className="card-body">
        <div className="list-group list-group-flush">
          {dishes?.map((dish, i) => (
            <div key={i} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{i + 1}. {dish.name} ({dish.category})</span>
              <span>{dish.totalOrdered} orders - ${dish.price}</span>
            </div>
          )) || <div className="text-muted">No data</div>}
        </div>
      </div>
    </div>
  );
};

export default PopularDishesCard;
