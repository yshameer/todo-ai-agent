import React from 'react';

const CategoryFilter = ({ selectedCategory, onCategoryChange, todoCounts }) => {
  const categories = [
    { name: 'All', count: todoCounts.All },
    { name: 'Work', count: todoCounts.Work },
    { name: 'Personal', count: todoCounts.Personal }
  ];

  return (
    <div className="category-filter">
      <h3>Filter by Category</h3>
      <div className="filter-buttons">
        {categories.map(category => (
          <button
            key={category.name}
            onClick={() => onCategoryChange(category.name)}
            className={`filter-btn ${selectedCategory === category.name ? 'active' : ''}`}
          >
            {category.name}
            <span className="count">({category.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;