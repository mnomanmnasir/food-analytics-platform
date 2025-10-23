import React from 'react';

const PeakTimesCard = ({ peakTimes }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">⏰ Peak Ordering Times</h5>
      </div>
      <div className="card-body">
        <div className="list-group list-group-flush">
          {peakTimes?.map(time => (
            <div key={time.timeRange} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{time.timeRange}</span>
              <span>{time.orderCount} orders</span>
            </div>
          )) || <div className="text-muted">No data</div>}
        </div>
      </div>
    </div>
  );
};

export default PeakTimesCard;
