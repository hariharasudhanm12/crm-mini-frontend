// Formik field wrapper components for text inputs and dropdown selects
import React from "react";
import { useField } from "formik";

export function FormInput({ label, helperText, ...props }) {
  const [field, meta] = useField(props);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={props.id || props.name} className="form-label">
          {label}
        </label>
      )}
      <input
        {...field}
        {...props}
        id={props.id || props.name}
        className={`input ${hasError ? "has-error" : ""}`}
      />
      {hasError ? (
        <div className="field-error">{meta.error}</div>
      ) : helperText ? (
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}

export function FormSelect({ label, options = [], defaultLabel = "Select option", ...props }) {
  const [field, meta] = useField(props);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={props.id || props.name} className="form-label">
          {label}
        </label>
      )}
      <select
        {...field}
        {...props}
        id={props.id || props.name}
        className={`select ${hasError ? "has-error" : ""}`}
      >
        <option value="">{defaultLabel}</option>
        {options.map((opt) => {
          const val = typeof opt === "object" ? opt.value : opt;
          const text = typeof opt === "object" ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {text}
            </option>
          );
        })}
      </select>
      {hasError && <div className="field-error">{meta.error}</div>}
    </div>
  );
}
