import React from 'react';
import backgroundImage from '../assets/bg.jpg';

function Home() {
  return (
    <div style={{
      height: '100vh',
      backgroundImage: `url()`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1 class="text">Welcome to Car Rental DApp</h1>
      <div>
        <p class="text">Created by Nguyen Thuy Quynh</p>
      </div>
    </div>
  );
}

export default Home;
