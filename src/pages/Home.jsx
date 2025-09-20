import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const Home = () => {
  return (
    <div className="space-y-12 lg:space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 lg:py-20 px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
          Find Your Perfect{' '}
          <span className="text-blue-600 block sm:inline">Study Group</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed">
          Connect with classmates, collaborate on projects, and ace your exams together. 
          Our AI-powered matching finds the perfect study partners for your learning style.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="large" className="w-full sm:w-auto px-8 py-3">
              Get Started Free
            </Button>
          </Link>
          <Link to="/about" className="w-full sm:w-auto">
            <Button variant="outline" size="large" className="w-full sm:w-auto px-8 py-3">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 lg:mb-12">
          Why Choose StudyGroup?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          <Card hover className="h-full">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                AI-powered algorithm matches you with compatible study partners based on learning styles and schedules.
              </p>
            </div>
          </Card>

          <Card hover className="h-full">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Real-time Collaboration</h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Chat, share notes, and collaborate on a digital whiteboard in real-time with your study group.
              </p>
            </div>
          </Card>

          <Card hover className="h-full md:col-span-2 lg:col-span-1">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Automatically find optimal meeting times that work for everyone in your study group.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 rounded-2xl mx-4 lg:mx-0 p-8 lg:p-12 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          Ready to start studying smarter?
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of students who've improved their grades with StudyGroup.
        </p>
        <Link to="/register">
          <Button size="large" className="px-8 py-3">
            Join StudyGroup Today
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;