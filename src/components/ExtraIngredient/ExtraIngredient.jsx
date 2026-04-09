import React from "react";
import "./styles.css";

const ExtraIngredient = ({ ingredient, onSelect, isChecked }) => {
  return (
    <div
      className={`extraIngredient ${isChecked ? "checked" : ""}`}
      onClick={() => onSelect(ingredient)}
    >
      <span className="ingredient__name">{ingredient}</span>
      <span className="ingredient__check">
        {isChecked ? <i className="ri-checkbox-circle-fill"></i> : <i className="ri-checkbox-blank-circle-line"></i>}
      </span>
    </div>
  );
};

export default ExtraIngredient;
