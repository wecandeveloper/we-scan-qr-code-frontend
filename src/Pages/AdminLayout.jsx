// AdminLayout.jsx
export default function AdminLayout({ children }) {
  return (
    <>
      <AdminHeader />
      <main>{children}</main>
    </>
  );
}