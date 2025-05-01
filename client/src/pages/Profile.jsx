import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, deleteAccount } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fashion-history');
        setHistory(response.data.history);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    if (success) {
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get the full image URL
  const getImageUrl = (relativePath) => {
    // Convert relative path to full URL
    const baseUrl = 'http://localhost:5000';
    // Replace backslashes with forward slashes for URLs
    const formattedPath = relativePath.replace(/\\/g, '/');
    return `${baseUrl}/${formattedPath}`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <Link to="/" className="back-link">
        <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="profile-card"
      >
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-joined">Joined {formatDate(user.created_at)}</p>
          </div>
        </div>

        <div className="profile-actions">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="delete-account-button"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </motion.button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm">
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="confirm-delete-button" onClick={handleDeleteAccount}>
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="history-card"
      >
        <h2 className="history-title">Your Fashion Score History</h2>

        {loading ? (
          <div className="history-loading">Loading your history...</div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <p>You haven't analyzed any outfits yet.</p>
            <Link to="/analyze" className="analyze-cta">
              Analyze Your First Outfit
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <div className="history-date">{formatDate(item.createdAt)}</div>
                  <div className="history-score">Score: {item.score}/10</div>
                </div>
                
                <div className="history-item-content">
                  <div className="history-image-container">
                    <img 
                      src={getImageUrl(item.imagePath)} 
                      alt="Outfit" 
                      className="history-image"
                    />
                  </div>

                  <div className="history-details">
                    <div className="history-feedback">
                      <h3>Style Feedback</h3>
                      <p>{item.feedback.style}</p>
                    </div>
                    
                    <div className="history-feedback">
                      <h3>Color Coordination</h3>
                      <p>{item.feedback.colorCoordination}</p>
                    </div>
                    
                    <div className="history-feedback">
                      <h3>Fit Assessment</h3>
                      <p>{item.feedback.fit}</p>
                    </div>
                    
                    <div className="history-recommendations">
                      <h3>Recommendations</h3>
                      <ul>
                        {item.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile; 