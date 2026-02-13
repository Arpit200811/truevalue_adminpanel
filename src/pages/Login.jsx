import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { CircleLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaLock, FaEnvelope, FaStore } from 'react-icons/fa';
import { DataService } from '../services/dataService';

const schema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await DataService.login(data.email, data.password);
      setLoading(false);
      
      if (result.success) {
        Swal.fire({
          title: '🎉 Welcome Back!',
          text: 'Succesfully logged into Cloude Admin Console',
          icon: 'success',
          showConfirmButton: false,
          timer: 1800,
          background: '#ffffff',
          iconColor: '#16a34a',
        });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        Swal.fire({
          title: 'Auth Failed',
          text: result.message,
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      setLoading(false);
      Swal.fire('Error', 'Something went wrong during authentication', 'error');
    }
  };

  return (
    <div className="login-bg d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg border-0 p-4" style={{ width: '100%', maxWidth: 400, borderRadius: 24 }}>
        <div className="text-center mb-4">
           <div className="d-inline-block bg-success bg-opacity-10 p-3 rounded-circle mb-3">
              <FaStore size={35} className="text-success" />
           </div>
           <h3 className="fw-bold text-success mb-1">CLOUDE ADMIN</h3>
           <p className="text-muted small">Enter your credentials to manage your store</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Email Address</label>
            <div className="input-group">
               <span className="input-group-text bg-light border-0"><FaEnvelope className="text-muted" /></span>
               <input
                 {...register('email')}
                 type="email"
                 className={`form-control bg-light border-0 ${errors.email ? 'is-invalid' : ''}`}
                 placeholder="admin@cloude.in"
                 disabled={loading}
               />
            </div>
            {errors.email && <div className="text-danger x-small mt-1">{errors.email.message}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-muted">Password</label>
            <div className="input-group">
               <span className="input-group-text bg-light border-0"><FaLock className="text-muted" /></span>
               <input
                 {...register('password')}
                 type="password"
                 className={`form-control bg-light border-0 ${errors.password ? 'is-invalid' : ''}`}
                 placeholder="••••••••"
                 disabled={loading}
               />
            </div>
            {errors.password && <div className="text-danger x-small mt-1">{errors.password.message}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 py-3 fw-bold shadow-sm"
            disabled={loading}
            style={{ borderRadius: 12, fontSize: '1rem', letterSpacing: '0.5px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>

          <div className="mt-4 text-center">
             <a href="#" className="text-success text-decoration-none small fw-bold opacity-75">Forgot Password?</a>
          </div>
        </form>
      </div>

      {loading && (
        <div className="loader-overlay">
          <CircleLoader color="#16a34a" size={70} />
        </div>
      )}

      <style>{`
        .login-bg {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }
        .loader-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.8); z-index: 9999;
        }
        .x-small { font-size: 0.75rem; }
        .form-control:focus {
           box-shadow: none;
           background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
