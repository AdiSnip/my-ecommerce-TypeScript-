import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import axiosInstance from "@/api/axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/auth/login", data);

            // Standard ApiResponse structure: { statusCode, data: { user, accessToken }, message, success }
            const { data: responseData } = response;
            const { user, accessToken } = responseData.data;
            const message = responseData.message;

            dispatch(setCredentials({ user, accessToken }));
            toast.success(message || "Logged in successfully");
            navigate("/");
        } catch (error: any) {
            console.error("Login Error:", error);
            const errorMessage = error.message || "Invalid credentials";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{" "}
                        <Link
                            to="/signup"
                            className="font-medium text-black hover:text-gray-800 transition-colors"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.email?.message}
                            {...register("email")}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register("password")}
                            />
                            <div className="absolute right-0 top-0 pr-3 pt-2">
                                {/* Forgot password link could go here */}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Link to="/forgot-password" className="text-sm font-medium text-gray-600 hover:text-black block mb-4 text-right">
                            Forgot your password?
                        </Link>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Sign in
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
