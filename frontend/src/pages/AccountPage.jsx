import PasswordForm from '../features/account/PasswordForm';
import ProfileForm from '../features/account/ProfileForm';
import ProfileSummary from '../features/account/ProfileSummary';

export default function AccountPage({ me }) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Account</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <ProfileSummary me={me} />
          <ProfileForm me={me} />
        </div>
        <PasswordForm />
      </div>
    </section>
  );
}
