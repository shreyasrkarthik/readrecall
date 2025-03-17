import { getServerSession } from 'next-auth';
import { UploadForm } from '@/components/Books/UploadForm';
import { getAppTheme } from '@/lib/colors';

export default async function UploadPage() {
  const session = await getServerSession();
  const appTheme = getAppTheme();

  if (!session?.user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className={`text-2xl font-semibold ${appTheme.primary} ${appTheme.darkPrimary}`}>Sign in to upload books</h1>
          <p className="mt-2 text-gray-600">You need to be signed in to upload books to your library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className={`mb-8 text-3xl font-bold ${appTheme.primary} ${appTheme.darkPrimary}`}>Upload a Book</h1>
        <UploadForm />
      </div>
    </div>
  );
} 