import { NavLink } from "react-router-dom";

export default function NavBar() {
  const links = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/analyze", label: "Analyze Sample" },
    { to: "/history", label: "History" },
    { to: "/architecture", label: "System Architecture" },
  ];

  return (
    <div className="navbar">
      <div className="brand">
        <span className="brand-mark" />
        FluoroFlow
      </div>
      <div className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
