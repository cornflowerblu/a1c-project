'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './context/auth-context';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { isLoggedIn, isLoading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isLoggedIn, isLoading, router]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-xl p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">A1C Estimator</h1>
          <p className="text-xl mb-8">
            Track your glucose readings and estimate your A1C levels with our
            easy-to-use tool.
          </p>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="bg-white text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-lg font-medium text-lg inline-block"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                href="/sign-in"
                className="bg-white text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-lg font-medium text-lg inline-block"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-lg font-medium text-lg inline-block"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">
              Track Glucose Readings
            </h3>
            <p className="text-gray-700">
              Easily log and monitor your glucose readings over time with our
              intuitive interface.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">
              Estimate A1C
            </h3>
            <p className="text-gray-700">
              Get an estimate of your A1C levels based on your glucose readings
              without waiting for lab results.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">
              Visualize Trends
            </h3>
            <p className="text-gray-700">
              See your glucose trends over time with clear, easy-to-understand
              charts and graphs.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="max-w-3xl mx-auto">
          <ol className="space-y-6">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                1
              </span>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Create an Account
                </h3>
                <p className="text-gray-700">
                  Sign up for a free account using our secure, passwordless
                  authentication.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                2
              </span>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Log Your Readings
                </h3>
                <p className="text-gray-700">
                  Enter your glucose readings with optional context like meal
                  times.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                3
              </span>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Get Your Estimate
                </h3>
                <p className="text-gray-700">
                  View your estimated A1C based on your glucose readings.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gray-100 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
          Join thousands of users who are taking control of their diabetes
          management with our A1C Estimator.
        </p>
        {!isLoggedIn && (
          <Link
            href="/sign-up"
            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium text-lg inline-block"
          >
            Create Your Free Account
          </Link>
        )}
      </section>
    </div>
  );
}
