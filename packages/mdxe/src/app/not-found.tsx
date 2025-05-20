export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '1rem' 
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>The page you are looking for does not exist.</p>
      <a href="/" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Return to Home</a>
    </div>
  )
}
