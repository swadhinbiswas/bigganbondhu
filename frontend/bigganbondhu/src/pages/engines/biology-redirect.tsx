// filepath: /home/swadhin/bigganbondhu/frontend/bigganbondhu/src/pages/engines/biology.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This component acts as a redirector to the new biology categories page
const BiologyEngine = () => {
  const navigate = useNavigate();

  // Redirect to the new biology categories page
  useEffect(() => {
    // We don't need to redirect since we're already at the right page
    // This component will be used by the router
  }, [navigate]);

  // Return empty component as we're redirecting immediately
  return null;
};

export default BiologyEngine;
