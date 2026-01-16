import type { User } from "../data/mockData";

interface ProfileCardProps {
  user: User;
}

export const ProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "16px",
      padding: "24px",
      backgroundColor: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      maxWidth: "350px",
      textAlign: "center"
    }}>
      <img 
        src={user.avatarUrl} 
        alt="Profile" 
        style={{ width: "100px", height: "100px", borderRadius: "50%", marginBottom: "15px", border: "4px solid #f0f0f0" }} 
      />
      
      <h2 style={{ margin: "0 0 5px 0", color: "#333" }}>{user.username}</h2>
      <p style={{ margin: "0 0 20px 0", color: "#666", fontSize: "0.9rem" }}>{user.email}</p>

      <div style={{ marginBottom: "20px" }}>
        <span style={{
          backgroundColor: user.status === "Safe" ? "#e8f5e9" : "#ffebee",
          color: user.status === "Safe" ? "#2e7d32" : "#c62828",
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "0.85rem",
          fontWeight: "bold"
        }}>
          Status: {user.status}
        </span>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "10px", 
        textAlign: "left", 
        backgroundColor: "#f9f9f9", 
        padding: "15px", 
        borderRadius: "8px" 
      }}>
        <div>
          <small style={{ color: "#888", display: "block" }}>Barangay</small>
          <strong>{user.barangay}</strong>
        </div>
        <div>
          <small style={{ color: "#888", display: "block" }}>Contact</small>
          <strong>{user.contactNumber}</strong>
        </div>
        <div>
          <small style={{ color: "#888", display: "block" }}>Age</small>
          <strong>{user.age}</strong>
        </div>
        <div>
          <small style={{ color: "#888", display: "block" }}>Gender</small>
          <strong>{user.gender}</strong>
        </div>
      </div>
    </div>
  );
};