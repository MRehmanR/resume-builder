import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, Download, Sparkles, Users, Zap, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-resume.jpg";

const Landing = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Assistance",
      description: "Get intelligent suggestions and improvements for your resume content"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Professional Templates",
      description: "Choose from modern, ATS-friendly resume templates"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "PDF Export",
      description: "Download your polished resume in high-quality PDF format"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Editing",
      description: "Chat with AI to make instant updates and refinements"
    }
  ];

  const benefits = [
    "Professional resume templates",
    "AI-powered content optimization",
    "Real-time chat assistance",
    "ATS-friendly formatting",
    "Instant PDF download",
    "Skills & experience enhancement"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-brand opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-brand-secondary to-brand-accent opacity-10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-brand">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
              ResumeBuilder AI
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="hidden sm:flex bg-gradient-brand/10 text-brand border-brand/20 hover:bg-gradient-brand hover:text-white transition-all duration-300">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Platform
            </Badge>
            <Link to="/chat">
              <Button variant="brand" size="lg" className="shadow-brand hover:shadow-xl">
                <Brain className="h-4 w-4 mr-2" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-24 lg:py-40 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 text-center lg:text-left">
              <div className="space-y-6">
                <Badge className="bg-gradient-brand/10 text-brand border-brand/20 px-4 py-2 text-sm font-medium hover:bg-gradient-brand hover:text-white transition-all duration-300 inline-flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Next-Gen AI Resume Builder
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
                  Build Your Perfect{" "}
                  <span className="bg-gradient-hero bg-clip-text text-transparent relative">
                    Resume
                    <div className="absolute -inset-1 bg-gradient-hero opacity-20 blur-xl rounded-lg"></div>
                  </span>{" "}
                  with AI
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Transform your career with our intelligent resume builder. Chat with AI, 
                  upload existing resumes, and create professional documents that land interviews.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/chat">
                  <Button variant="brand" size="xl" className="w-full sm:w-auto group">
                    <Sparkles className="h-5 w-5 mr-3 group-hover:animate-spin" />
                    Start Building Now
                  </Button>
                </Link>
                <Button variant="brand-outline" size="xl" className="w-full sm:w-auto group">
                  <Users className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  View Examples
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">No signup required</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-brand/10 text-brand border border-brand/20">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">100% Free to use</span>
                </div>
              </div>
            </div>

            <div className="relative lg:justify-self-end">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-2xl rounded-3xl animate-pulse-slow"></div>
                <img 
                  src={heroImage} 
                  alt="Professional Resume Builder Interface" 
                  className="relative w-full h-auto rounded-3xl shadow-2xl shadow-brand/30 animate-float border border-white/10"
                />
                <div className="absolute -top-6 -right-6 bg-gradient-brand p-4 rounded-2xl shadow-2xl shadow-brand/40 animate-bounce">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-success to-brand-accent p-4 rounded-2xl shadow-2xl shadow-success/40 animate-pulse-slow">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-background via-brand/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-20">
            <Badge className="bg-gradient-brand/10 text-brand border-brand/20 px-4 py-2 text-sm font-medium">
              ✨ Powerful Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Why Choose Our{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                AI Resume Builder
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to help you create standout resumes that get noticed by employers and land your dream job
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border-0 bg-gradient-to-br from-background to-brand/5 shadow-xl shadow-brand/10 hover:shadow-2xl hover:shadow-brand/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 space-y-6">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-brand/10 text-brand group-hover:bg-gradient-brand group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl group-hover:text-brand transition-colors duration-300">{feature.title}</h3>
                  <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Everything You Need to{" "}
                <span className="bg-gradient-brand bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Our comprehensive platform provides all the tools you need to create a winning resume
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gradient-card transition-all duration-300">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/chat">
                <Button variant="hero" size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-brand" />
              <span className="font-semibold bg-gradient-brand bg-clip-text text-transparent">
                ResumeBuilder AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ResumeBuilder AI. Built with AI to help you succeed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;