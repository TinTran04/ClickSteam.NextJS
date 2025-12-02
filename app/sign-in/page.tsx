"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { useAuth } from "@/contexts/AuthContext";   // <<< thêm

// Cấu hình Amplify dùng Cognito User Pool
Amplify.configure({
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  },
});

function RedirectAfterSignIn({ user }: { user: any }) {
  const router = useRouter();
  const { refreshUser } = useAuth();               // <<< lấy từ context

  useEffect(() => {
    if (user) {
      // Sync lại AuthContext để Header biết là đã đăng nhập
      refreshUser().catch((err) =>
        console.error("Failed to refresh user after login", err),
      );

      // Đăng nhập xong → về home
      router.push("/");
    }
  }, [user, refreshUser, router]);

  return null;
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Authenticator>
          {({ user }) => <RedirectAfterSignIn user={user} />}
        </Authenticator>
      </div>
    </div>
  );
}
