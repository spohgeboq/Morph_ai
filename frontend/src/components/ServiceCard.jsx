import React from 'react';

const ServiceCard = ({ id, title, icon, isActive, onClick }) => {
  return (
    <div 
      className={`service-card ${isActive ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      <div className="service-icon">
        {icon}
      </div>
      <div className="service-title">
        {title}
      </div>
    </div>
  );
};

export default ServiceCard;
