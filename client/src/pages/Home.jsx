import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: 0.3 + (custom * 0.1), 
        duration: 0.5 
      }
    })
  };

  return (
    <motion.div 
      className="home-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
        <div className="floating-element element-4"></div>
      </div>
      
      <motion.div
        variants={itemVariants}
        className="home-header"
      >
        <h1 className="home-title">
          Fashion<span className="accent-text">Score</span>
        </h1>
        <p className="home-description">
          Get instant AI-powered feedback on your outfit with style analysis, color coordination rating, and personalized recommendations.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="cta-container"
      >
        <Link 
          to="/analyze"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="cta-link"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            Analyze Your Outfit
          </motion.button>
        </Link>

        {isHovered && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cta-tooltip"
          >
            Upload a photo to get your fashion score!
          </motion.p>
        )}
      </motion.div>

      <div className="features-container">
        <motion.div
          custom={0}
          variants={featureVariants}
          whileHover={{ y: -10 }}
          className="feature-card"
        >
          <h3 className="feature-title">Style Analysis</h3>
          <p className="feature-description">Get detailed feedback on your overall style and fashion choices to help you understand your unique aesthetic.</p>
        </motion.div>
        
        <motion.div
          custom={1}
          variants={featureVariants}
          whileHover={{ y: -10 }}
          className="feature-card"
        >
          <h3 className="feature-title">Color Coordination</h3>
          <p className="feature-description">Learn how well your colors work together and receive expert guidance on creating harmonious palettes.</p>
        </motion.div>
        
        <motion.div
          custom={2}
          variants={featureVariants}
          whileHover={{ y: -10 }}
          className="feature-card"
        >
          <h3 className="feature-title">Personalized Tips</h3>
          <p className="feature-description">Receive custom recommendations tailored to your specific outfit that will help elevate your personal style.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home; 