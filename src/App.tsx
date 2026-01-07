import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmergencyHotlines from './pages/EmergencyHotlines';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route is Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/hotlines" element={<EmergencyHotlines />} />

      </Routes>
    </Router>
  );
}

export default App;