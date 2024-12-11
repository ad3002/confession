import AuthForm from '@/components/AuthForm';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-center">Confession</h1>
      <AuthForm />
    </div>
  );
}
