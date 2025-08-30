// layouts/AdminLayout.js
import "./AdminLayout.scss"

import AdminHeader from "../../AdminLayout/AdminHeader/AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <main>{children}</main>
      {/* Admin does not need footer */}
    </div>
  );
}
