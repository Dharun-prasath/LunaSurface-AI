// Dashboard Component
const Dashboard = () => {
  return (
    <div style={styles.dashboard}>
    </div>
  );
};

// Styles
const styles = {
  navbar: {
    backgroundColor: '#202020',
    color: '#ffffff',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    margin: 0,
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    gap: '20px',
    padding: 0,
    margin: 0,
  },
  navItem: {
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'color 0.3s ease',
  },
  detectButton: {
    backgroundColor: '#ff4081',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
  dashboard: {
    backgroundColor: '#202020',
    color: '#ffffff',
    padding: '20px',
    minHeight: '100vh',
  },
};

export default Dashboard;
