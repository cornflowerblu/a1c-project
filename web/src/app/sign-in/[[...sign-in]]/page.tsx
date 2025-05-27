import { SignIn } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen py-12">
      <SignIn 
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
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