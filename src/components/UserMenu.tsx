import { useAuth } from '../lib/AuthContext';

interface UserMenuProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function UserMenu({ onLoginClick, onSignupClick }: UserMenuProps) {
  const { user, credits, loading, signOut } = useAuth();

  if (loading) {
    return <div className="user-menu"><span className="user-menu-skeleton" /></div>;
  }

  if (!user) {
    return (
      <div className="user-menu">
        <button className="btn-ghost" onClick={onLoginClick}>Log in</button>
        <button className="btn-primary" onClick={onSignupClick}>Sign up</button>
      </div>
    );
  }

  return (
    <div className="user-menu">
      <span className="credit-badge" title="Available credits">⚡ {credits}</span>
      <span className="user-email">{user.email}</span>
      <button className="btn-ghost" onClick={signOut}>Sign out</button>
    </div>
  );
}
