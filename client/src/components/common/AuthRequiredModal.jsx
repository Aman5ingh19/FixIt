import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Modal from './Modal';
import Button from './Button';

export default function AuthRequiredModal() {
  const { authModal, closeAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    closeAuthModal();
    navigate('/login', { state: { from: authModal.returnUrl } });
  };

  const handleRegister = () => {
    closeAuthModal();
    navigate('/register', { state: { from: authModal.returnUrl } });
  };

  return (
    <Modal
      isOpen={authModal.isOpen}
      onClose={closeAuthModal}
      size="sm"
      showClose={true}
    >
      <div className="text-center py-2">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4 border border-primary-100 dark:border-primary-800 shadow-sm">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-surface-900 dark:text-surface-900 mb-2">
          {authModal.title || 'Sign in required'}
        </h3>

        <p className="text-sm text-surface-500 dark:text-surface-600 mb-6 leading-relaxed">
          {authModal.message || 'Create an account or sign in to continue with this action.'}
        </p>

        <div className="space-y-2.5">
          <Button
            onClick={handleSignIn}
            fullWidth
            size="lg"
            icon={LogIn}
          >
            Sign In
          </Button>

          <Button
            onClick={handleRegister}
            variant="outline"
            fullWidth
            size="lg"
            icon={UserPlus}
          >
            Create Account
          </Button>

          <Button
            onClick={closeAuthModal}
            variant="ghost"
            fullWidth
            size="md"
            className="text-surface-500 dark:text-surface-600 hover:text-surface-700 dark:hover:text-surface-800"
          >
            Continue Browsing
          </Button>
        </div>
      </div>
    </Modal>
  );
}
