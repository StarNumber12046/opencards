import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { captures, userData, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { hashPassword } from "~/server/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  async function login(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Mock login - in real app would validate credentials
    if (email && password) {
      // Set mock auth token
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

        .execute();
      if (!user) {
        console.log("User not found");
        return redirect("/app/login");
      }
      if (user.hashedPassword !== (await hashPassword(password))) {
        console.log("Invalid password");
        return redirect("/app/login");
      }
      (await cookies()).set("authToken", user.token);
      redirect("/app/deck");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
