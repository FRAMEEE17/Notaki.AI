// import { SignIn } from "@clerk/nextjs";
// import type { Metadata } from "next";

// export const generateMetadata = async (): Promise<Metadata> => {
//   return {
//     title: "NOTAKI - Sign In",
//   };
// };

// export default function SignInPage() {
//   return (
//     <div className="flex h-screen items-center justify-center">
//       <SignIn appearance={{ variables: { colorPrimary: "#0F172A" } }} />
//     </div>
//   );
// }

import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NOTAKI - Sign In",
};

export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn appearance={{ variables: { colorPrimary: "#0F172A" } }} />
    </div>
  );
}