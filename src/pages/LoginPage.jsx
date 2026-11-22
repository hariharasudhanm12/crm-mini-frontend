// Login page component with Formik and Yup validation
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { loginUser, clearLoginError, addToast } from "../store/crmSlice";
import { APP_NAME } from "../config";
import ErrorBanner from "../components/ErrorBanner";
import Toast from "../components/Toast";

// Material UI icons only
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import "./LoginPage.css";

// Rules for the login form
const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.crm.token);
  const loginError = useSelector((state) => state.crm.login.error);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleForgotPassword = (e) => {
    e.preventDefault();
    dispatch(addToast({ type: "info", message: "Not available in this version" }));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(
        loginUser({
          email: values.email.trim(),
          password: values.password,
        })
      ).unwrap();
      navigate("/dashboard");
    } catch {
      // Server error message is stored in Redux login.error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-root">
      <Toast />
      <div className="login-card">
        {/* Header with App Logo and Name */}
        <div className="login-brand">
          <div className="login-brand-icon">M</div>
          <h1 className="login-brand-name">{APP_NAME}</h1>
        </div>

        <div className="login-header">
          <h2 className="login-title">Sign in to your account</h2>
          <p className="login-subtitle">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Formik Login Form */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className={`input ${
                    touched.email && errors.email ? "has-error" : ""
                  }`}
                  value={values.email}
                  onChange={(e) => {
                    if (loginError) dispatch(clearLoginError());
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                />
                {touched.email && errors.email && (
                  <div className="field-error">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`input ${
                      touched.password && errors.password ? "has-error" : ""
                    }`}
                    value={values.password}
                    onChange={(e) => {
                      if (loginError) dispatch(clearLoginError());
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="small" />
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <div className="field-error">{errors.password}</div>
                )}
              </div>

              <div className="login-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  className="forgot-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary login-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowForwardOutlinedIcon fontSize="small" />
                  </>
                )}
              </button>

              {/* Inline server error banner under login button */}
              {loginError && (
                <div className="login-error-wrapper">
                  <ErrorBanner message={loginError} />
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
