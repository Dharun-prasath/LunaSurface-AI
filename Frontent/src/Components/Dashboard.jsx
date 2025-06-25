// Navbar Component
const Navbar = () => {
   return (
       <nav style={styles.navbars}>
          <h1>LunaSurface AI</h1>
            <ul>
              <li>Home</li>
              <li>About</li>
              <li>Services</li>
              </ul>
          <button>Detect</button>
       </nav>
  );
    
};

// Dashboard Component
const Dashboard = () => {
  return (
    <div style={{ backgroundColor: '#202020', color: '#ffffff', padding: '20px', height: '100vh' }}>
      <Navbar/>

    </div>
  );
};

// Styles
const styles = {
  navbars: {
    backgroundColor: '#202020',
    color: '#ffffff',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  

};

export default Dashboard;