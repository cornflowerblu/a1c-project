import { SignUp } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen py-12">
      <SignUp 
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
            footerActionLink: 'text-blue-500 hover:text-blue-600',
          },
        }}
      />
    </div>
  );
}