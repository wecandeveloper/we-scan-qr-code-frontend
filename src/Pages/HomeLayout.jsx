// MainLayout.jsx
export default function MainLayout({ children }) {
  return (
    <>
        <Header /> 
            <main>{children}</main>
        <Footer />
    </>
  );
}