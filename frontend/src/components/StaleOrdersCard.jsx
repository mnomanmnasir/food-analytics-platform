import React from 'react';

const StaleOrdersCard = ({ staleOrders }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">🚨 Stale Orders (30 min)</h5>
      </div>
      <div className="card-body">
        <div className="list-group list-group-flush">
          {staleOrders?.map(order => (
            <div key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>Order #{order.id}</span>
              <span>{Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000)} min old</span>
            </div>
          )) || <div className="text-muted">No stale orders</div>}
        </div>
      </div>
    </div>
  );
};

export default StaleOrdersCard;
