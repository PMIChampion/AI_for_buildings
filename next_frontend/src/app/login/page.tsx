'use client';

import LoginForm from '../../components/LoginForm';

export default function Login() { 
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'flex-start', 
        alignItems: 'center',
        backgroundImage: "url('/auth.png')", 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        style={{
          width: '40%', 
          height: '1000px',
          display: 'flex',
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(255, 255, 255, 0)',
          padding: 'calc((40vw - 250px) / 2) 0'
        }}
      >

        <LoginForm />
      </div>
      <div style={{
          width: '56%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start', 
          alignItems: 'flex-start'
          
        }}>
        <h1 style={{height: '100%', marginBottom: '20px', padding: '30px 17%', fontSize: 'min(50px, 7vh)'}}>Выявление дефектов в бетонных конструкциях</h1>
        <p style={{height: '100%',marginBottom: '70%', padding: '0 17%', fontSize: 'min(25px, 4vh)'}}>Данный сайт поможет эффективно определить дефекты, обеспечивая при этом скорость и точность работы</p>
      </div>
      
    </div>
  );
}