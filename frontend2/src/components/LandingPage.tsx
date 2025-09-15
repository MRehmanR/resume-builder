import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Download, Upload, MessageSquare, Sparkles, CheckCircle } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import resumeIcon from "@/assets/resume-icon.png";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const features = [
    {
      icon: MessageSquare,
      title: "AI-Powered Chat",
      description: "Build your resume through natural conversation with our intelligent assistant"
    },
    {
      icon: FileText,
      title: "Professional Templates",
      description: "Choose from beautifully designed templates that impress employers"
    },
    {
      icon: Download,
      title: "Instant Download",
      description: "Download your resume in PDF format ready for job applications"
    },
    {
      icon: Upload,
      title: "Upload & Update",
      description: "Upload existing resumes and update them with AI assistance"
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroBackground} 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
        </div>
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-20 h-20 bg-white/8 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header - Enhanced */}
        <header className="section-padding py-6 sm:py-8">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 animate-slide-up">
              <img src={resumeIcon} alt="Resume Builder" className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse-slow" />
              <span className="text-xl sm:text-2xl font-bold text-white">ResumeAI</span>
            </div>
            <div className="hidden md:flex space-x-6 lg:space-x-8 animate-fade-in-delay-1">
              <a href="#features" className="text-white/80 hover:text-white transition-all duration-200 hover:scale-105">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-all duration-200 hover:scale-105">How it Works</a>
              <a href="#testimonials" className="text-white/80 hover:text-white transition-all duration-200 hover:scale-105">Reviews</a>
            </div>
            <Button 
              variant="outline"
              onClick={onGetStarted}
              className="md:hidden btn-responsive border-white/30 text-white hover:bg-white/10 text-sm px-4 py-2"
            >
              Get Started
            </Button>
          </nav>
        </header>

        {/* Hero Section - Enhanced */}
        <section className="section-padding py-12 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 animate-slide-up leading-tight">
                  Build Your
                  <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-pulse-slow">
                    Dream Resume
                  </span>
                  with AI Magic
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-delay-1 leading-relaxed">
                  Create professional resumes in minutes using our AI-powered chatbot. Just tell us about yourself through natural conversation, and we'll craft the perfect resume.
                </p>
                
                {/* Stats */}
                <div className="flex justify-center lg:justify-start space-x-6 sm:space-x-8 mb-6 sm:mb-8 animate-fade-in-delay-1">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">10K+</div>
                    <div className="text-xs sm:text-sm text-white/70">Resumes Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">95%</div>
                    <div className="text-xs sm:text-sm text-white/70">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">2 Min</div>
                    <div className="text-xs sm:text-sm text-white/70">Average Time</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in-delay-2">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={onGetStarted}
                    className="btn-responsive btn-mobile bg-white text-primary hover:bg-white/90 shadow-glow font-semibold"
                  >
                    <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Get Started Free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="btn-responsive btn-mobile border-white/30 text-white hover:bg-white/10 font-medium"
                  >
                    <span className="hidden sm:inline">Watch Demo</span>
                    <span className="sm:hidden">Demo</span>
                  </Button>
                </div>
              </div>
              
              <div className="relative animate-fade-in-delay-3 order-1 lg:order-2">
                <div className="glass rounded-3xl p-4 sm:p-8 transform rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-105">
                  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-large">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Sarah Johnson</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">Product Manager</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-gradient-primary rounded-full w-4/5 animate-pulse"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-gradient-primary rounded-full w-3/5 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-gradient-primary rounded-full w-3/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">95% Complete</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
                
                {/* Floating elements around preview */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-purple-400/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section id="features" className="section-padding">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 animate-slide-up">
                Why Choose ResumeAI?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-delay-1">
                Our AI-powered platform makes resume building effortless and professional
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="glass-strong border-white/20 p-4 sm:p-6 text-center hover:scale-105 transition-all duration-300 hover:bg-white/20"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-soft">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="glass-strong border-white/20 p-6 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 animate-slide-up">
                Ready to Build Your Resume?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 animate-fade-in-delay-1">
                Join thousands of professionals who've landed their dream jobs with ResumeAI
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in-delay-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  <span className="text-white text-sm sm:text-base">Free to get started</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  <span className="text-white text-sm sm:text-base">No credit card required</span>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={onGetStarted}
                className="btn-responsive btn-mobile bg-white text-primary hover:bg-white/90 shadow-glow font-semibold animate-fade-in-delay-2"
              >
                <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                Start Building Now
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;