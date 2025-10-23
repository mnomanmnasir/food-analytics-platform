import React from 'react';

const OrderEventsCard = ({ orderEvents }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">📦 Recent Order Events</h5>
      </div>
      <div className="card-body">
        <div className="events-log">
          {orderEvents.slice(-5).map((event, i) => (
            <div key={i} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between">
                <small>{event.time}</small>
              </div>
              <p className="mb-1">{event.title} - Order #{event.data.id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderEventsCard;
