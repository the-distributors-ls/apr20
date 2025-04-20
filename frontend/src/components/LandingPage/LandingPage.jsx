// LandingPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import NavBar from "../NavBar/NavBar";
import {
  ChevronRight,
  ChevronDown,
  Shield,
  CheckCircle,
  RefreshCw,
  BarChart2,
  Users,
  DollarSign,
  Clock,
  Zap,
} from "lucide-react";

// Custom components
const StatCounter = ({ value, label, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start > end) start = end;
      setCount(Math.floor(start));
      if (start === end) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="stat-counter">
      <h3>
        {count}
        {suffix}
      </h3>
      <p>{label}</p>
    </div>
  );
};

const TestimonialCard = ({ quote, author, role, company, image }) => (
  <motion.div
    className="testimonial-card"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.5 }}
  >
    <div className="quote-mark">"</div>
    <p className="testimonial-quote">{quote}</p>
    <div className="testimonial-author">
      <div className="author-image">
        <img src={image || "/api/placeholder/60/60"} alt={author} />
      </div>
      <div className="author-info">
        <h4>{author}</h4>
        <p>
          {role}, {company}
        </p>
      </div>
    </div>
  </motion.div>
);

const LandingPage = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // State for FAQ accordion
  const [activeQuestion, setActiveQuestion] = useState(null);

  // State for testimonial carousel
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const testimonials = [
    {
      quote:
        "Letsema has transformed how we assess loan applications. Our default rates have dropped by 40% since joining the network.",
      author: "Thabo Mokoena",
      role: "Loan Officer",
      company: "Basotho Microfinance",
      image: "/api/placeholder/60/60",
    },
    {
      quote:
        "The shared credit history repository has been game-changing for our risk assessment process. We can now make informed decisions quickly.",
      author: "Lineo Makara",
      role: "CEO",
      company: "Women's Finance Trust",
      image: "/api/placeholder/60/60",
    },
    {
      quote:
        "Integration was seamless and the support team was exceptional throughout our onboarding process.",
      author: "Motseki Lebesa",
      role: "IT Director",
      company: "Rural Credit Association",
      image: "/api/placeholder/60/60",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // FAQ data
  const faqData = [
    {
      question: "How does Letsema protect sensitive financial data?",
      answer:
        "Letsema employs bank-grade encryption protocols for all data, both in transit and at rest. Our distributed architecture includes role-based access controls, audit logging, and regular security assessments to ensure the highest level of data protection for all participating MFIs.",
    },
    {
      question: "What is the onboarding process for new MFIs?",
      answer:
        "New MFIs undergo a streamlined 3-step process: registration verification, system integration, and staff training. Our dedicated onboarding team provides personalized support throughout the process, typically completing full integration within 2-3 weeks.",
    },
    {
      question:
        "Can Letsema integrate with our existing loan management software?",
      answer:
        "Yes, Letsema is designed with interoperability in mind. We provide robust APIs and pre-built connectors for common financial software systems used in Lesotho. Our technical team works closely with your IT staff to ensure seamless integration.",
    },
    {
      question: "How does the shared credit history repository work?",
      answer:
        "The repository securely aggregates anonymized borrower credit data across all participating MFIs while maintaining regulatory compliance. When processing a loan application, the system checks this repository to verify the applicant's complete borrowing history, helping prevent loan stacking and improve risk assessment.",
    },
  ];

  return (
    <>
      <NavBar />
      <div className="landing-container">
        {/* Hero Section - Enhanced with animated elements and a gradient overlay */}
        <div className="hero-section">
          <div className="hero-gradient-overlay"></div>
          <div className="hero-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>

          <div className="hero-content">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span>Revolutionary MFI Collaboration Platform</span>
            </motion.div>

            <motion.h1
              className="hero-title"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
            >
              Unifying <span className="text-gradient">Microfinance</span> in
              Lesotho
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Letsema connects microfinance institutions through a secure
              distributed platform, enabling shared credit histories, preventing
              loan stacking, and bringing financial inclusion to underserved
              communities.
            </motion.p>

            <motion.div
              className="hero-buttons"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link to="/register" className="btn-primary">
                Register Your MFI <ChevronRight size={16} />
              </Link>
              <Link to="/demo" className="btn-secondary">
                Request Live Demo
              </Link>
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <StatCounter value="18" label="MFIs Connected" />
              <div className="stat-divider"></div>
              <StatCounter value="42" suffix="%" label="Reduced Defaults" />
              <div className="stat-divider"></div>
              <StatCounter value="65" suffix="K+" label="Borrowers Served" />
            </motion.div>
          </div>

          <motion.div
            className="hero-image"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="image-container">
              <div className="dashboard-mockup">
                <div className="mockup-header">
                  <div className="mockup-header-controls">
                    <span className="control control-red"></span>
                    <span className="control control-yellow"></span>
                    <span className="control control-green"></span>
                  </div>
                  <div className="mockup-header-title">Letsema Dashboard</div>
                  <div className="mockup-header-user">
                    <div className="user-avatar"></div>
                  </div>
                </div>
                <div className="mockup-sidebar">
                  <div className="mockup-menu-item active"></div>
                  <div className="mockup-menu-item"></div>
                  <div className="mockup-menu-item"></div>
                  <div className="mockup-menu-item"></div>
                  <div className="mockup-menu-item"></div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-metrics">
                    <div className="metric-card"></div>
                    <div className="metric-card"></div>
                    <div className="metric-card"></div>
                  </div>
                  <div className="mockup-chart"></div>
                  <div className="mockup-table">
                    <div className="table-header"></div>
                    <div className="table-row"></div>
                    <div className="table-row"></div>
                    <div className="table-row"></div>
                  </div>
                </div>
              </div>
              <div className="dashboard-reflection"></div>
            </div>
          </motion.div>
        </div>

        {/* Trusted By Section with logos */}
        <div className="trusted-by-section">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            TRUSTED BY LEADING FINANCIAL INSTITUTIONS
          </motion.p>
          <div className="logo-container">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="partner-logo"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="logo-placeholder"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Problem Statement Section */}
        <section className="problem-statement-section">
          <div className="section-container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2>The Challenge</h2>
              <p>
                Microfinance institutions in Lesotho operate in isolation,
                creating significant challenges
              </p>
            </motion.div>

            <div className="problem-cards">
              {[
                {
                  icon: <Users size={32} />,
                  title: "Isolated Data",
                  description:
                    "MFIs can't access borrower credit histories from other institutions, leading to incomplete risk assessments",
                },
                {
                  icon: <DollarSign size={32} />,
                  title: "Loan Stacking",
                  description:
                    "Borrowers can obtain multiple loans from different MFIs, increasing default likelihood",
                },
                {
                  icon: <Clock size={32} />,
                  title: "Inefficient Processing",
                  description:
                    "Lengthy manual loan approval processes create delays and administrative overhead",
                },
              ].map((problem, index) => (
                <motion.div
                  className="problem-card"
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <div className="card-icon">{problem.icon}</div>
                  <h3>{problem.title}</h3>
                  <p>{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section - Enhanced with animation and visual elements */}
        <section className="solution-section">
          <div className="solution-gradient-bg"></div>
          <div className="section-container">
            <motion.div
              className="section-header light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2>Our Solution</h2>
              <p>
                Letsema brings microfinance institutions together on a powerful
                distributed platform
              </p>
            </motion.div>

            <div className="solution-showcase">
              <motion.div
                className="solution-image"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="solution-platform-image">
                  <div className="platform-nodes">
                    <div className="node node-1"></div>
                    <div className="node node-2"></div>
                    <div className="node node-3"></div>
                    <div className="node node-4"></div>
                    <div className="connection connection-1-2"></div>
                    <div className="connection connection-1-3"></div>
                    <div className="connection connection-2-4"></div>
                    <div className="connection connection-3-4"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="solution-features"
                variants={staggerChildren}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    icon: <Shield size={24} />,
                    title: "Secure Data Sharing",
                    description:
                      "Share borrower information while maintaining strict security and privacy",
                  },
                  {
                    icon: <CheckCircle size={24} />,
                    title: "Verified Credit History",
                    description:
                      "Access complete borrower credit profiles across all member MFIs",
                  },
                  {
                    icon: <RefreshCw size={24} />,
                    title: "Real-time Updates",
                    description:
                      "Get instant loan status and repayment tracking across the platform",
                  },
                  {
                    icon: <BarChart2 size={24} />,
                    title: "Advanced Analytics",
                    description:
                      "Leverage data-driven insights for better lending decisions",
                  },
                ].map((feature, index) => (
                  <motion.div
                    className="solution-feature-item"
                    key={index}
                    variants={fadeInUp}
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-content">
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section - More interactive with animated steps */}
        <section className="how-it-works-section">
          <div className="section-container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2>How Letsema Works</h2>
              <p>A seamless platform connecting microfinance institutions</p>
            </motion.div>

            <div className="workflow-container">
              {[
                {
                  number: "01",
                  title: "MFI Onboarding",
                  description:
                    "Institutions register, verify credentials, and integrate with the platform",
                  icon: <Users size={24} />,
                },
                {
                  number: "02",
                  title: "Data Integration",
                  description:
                    "Loan and borrower histories are securely shared across the network",
                  icon: <RefreshCw size={24} />,
                },
                {
                  number: "03",
                  title: "Enhanced Loan Processing",
                  description:
                    "MFIs access shared credit data to improve loan application assessment",
                  icon: <CheckCircle size={24} />,
                },
                {
                  number: "04",
                  title: "Ongoing Monitoring",
                  description:
                    "Track loan performance and borrower activity across institutions",
                  icon: <BarChart2 size={24} />,
                },
              ].map((step, index) => (
                <motion.div
                  className="workflow-step"
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                >
                  <div className="step-indicator">
                    <div className="step-number">{step.number}</div>
                    <div className="step-icon">{step.icon}</div>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  {index < 3 && <div className="step-connector"></div>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section - with rotating testimonials */}
        <section className="testimonials-section">
          <div className="testimonials-bg-pattern"></div>
          <div className="section-container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2>Success Stories</h2>
              <p>Hear from microfinance institutions already using Letsema</p>
            </motion.div>

            <div className="testimonial-carousel">
              <AnimatePresence mode="wait">
                <TestimonialCard
                  key={testimonialIndex}
                  {...testimonials[testimonialIndex]}
                />
              </AnimatePresence>

              <div className="carousel-indicators">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-indicator ${
                      index === testimonialIndex ? "active" : ""
                    }`}
                    onClick={() => setTestimonialIndex(index)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits Section with statistics */}
        <section className="benefits-section">
          <div className="section-container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2>Why Choose Letsema</h2>
              <p>
                Transforming microfinance in Lesotho with measurable results
              </p>
            </motion.div>

            <div className="benefits-grid">
              {[
                {
                  metric: "42%",
                  title: "Reduction in Defaults",
                  description:
                    "MFIs report significant decreases in loan defaults after joining the Letsema network",
                },
                {
                  metric: "3x",
                  title: "Faster Loan Processing",
                  description:
                    "Streamlined application process with instant credit history verification",
                },
                {
                  metric: "68%",
                  title: "Decrease in Fraud",
                  description:
                    "Shared data helps identify and prevent fraudulent loan applications",
                },
                {
                  metric: "99.9%",
                  title: "System Uptime",
                  description:
                    "Our distributed architecture ensures reliable service for all operations",
                },
              ].map((benefit, index) => (
                <motion.div
                  className="benefit-card"
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <h3 className="benefit-metric">{benefit.metric}</h3>
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Strengths Section */}
        <section className="tech-section">
          <div className="tech-gradient-bg"></div>
          <div className="section-container">
            <motion.div
              className="section-header light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2>Technical Excellence</h2>
              <p>Built with modern, scalable technologies</p>
            </motion.div>

            <div className="tech-features">
              <motion.div
                className="tech-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="tech-icon">
                  <Zap size={32} />
                </div>
                <div className="tech-content">
                  <h3>Distributed Architecture</h3>
                  <p>
                    Our hybrid database approach combines PostgreSQL for
                    structured financial records and MongoDB/Cassandra for
                    distributed credit history, ensuring both reliability and
                    performance.
                  </p>
                  <ul className="tech-list">
                    <li>Fault-tolerant design</li>
                    <li>Horizontal scalability</li>
                    <li>High availability</li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="tech-stack"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h3>Technology Stack</h3>
                <div className="stack-grid">
                  <div className="stack-item">
                    <div className="stack-icon django"></div>
                    <span>Django</span>
                  </div>
                  <div className="stack-item">
                    <div className="stack-icon react"></div>
                    <span>React</span>
                  </div>
                  <div className="stack-item">
                    <div className="stack-icon postgres"></div>
                    <span>PostgreSQL</span>
                  </div>
                  <div className="stack-item">
                    <div className="stack-icon mongodb"></div>
                    <span>MongoDB</span>
                  </div>
                  <div className="stack-item">
                    <div className="stack-icon docker"></div>
                    <span>Docker</span>
                  </div>
                  <div className="stack-item">
                    <div className="stack-icon oauth"></div>
                    <span>OAuth 2.0</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section with accordion */}
        <section className="faq-section">
          <div className="section-container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2>Frequently Asked Questions</h2>
              <p>Common questions about the Letsema platform</p>
            </motion.div>

            <div className="faq-container">
              {faqData.map((faq, index) => (
                <motion.div
                  className={`faq-item ${
                    activeQuestion === index ? "active" : ""
                  }`}
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div
                    className="faq-question"
                    onClick={() =>
                      setActiveQuestion(activeQuestion === index ? null : index)
                    }
                  >
                    <h3>{faq.question}</h3>
                    <div className="question-icon">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {activeQuestion === index && (
                      <motion.div
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="cta-section">
          <div className="cta-particles">
            <div className="cta-particle"></div>
            <div className="cta-particle"></div>
            <div className="cta-particle"></div>
          </div>
          <motion.div
            className="cta-container"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="cta-badge">Get Started Today</span>
            <h2>Join the Financial Revolution in Lesotho</h2>
            <p>
              Connect with other microfinance institutions to reduce loan
              defaults, improve risk assessment, and increase financial
              inclusion across Lesotho.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary cta-button">
                Register Your MFI
              </Link>
              <Link to="/contact" className="btn-outline cta-button">
                Contact Our Team
              </Link>
            </div>
            <div className="cta-footer">
              <div className="cta-stat">
                <div className="cta-number">14-day</div>
                <div className="cta-label">Free Trial</div>
              </div>
              <div className="cta-divider"></div>
              <div className="cta-stat">
                <div className="cta-number">2-3 weeks</div>
                <div className="cta-label">Full Integration</div>
              </div>
              <div className="cta-divider"></div>
              <div className="cta-stat">
                <div className="cta-number">24/7</div>
                <div className="cta-label">Support</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Enhanced Footer */}
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Letsema</h3>
              <p>Distributed Microfinance Loan Management System</p>
              <div className="social-links">
                <a href="#" className="social-link">
                  <div className="social-icon facebook"></div>
                </a>
                <a href="#" className="social-link">
                  <div className="social-icon twitter"></div>
                </a>
                <a href="#" className="social-link">
                  <div className="social-icon linkedin"></div>
                </a>
              </div>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a href="#">Features</a>
                <a href="#">Security</a>
                <a href="#">API</a>
                <a href="#">Pricing</a>
              </div>
              <div className="link-group">
                <h4>Resources</h4>
                <a href="#">Documentation</a>
                <a href="#">Guides</a>
                <a href="#">Case Studies</a>
                <a href="#">Blog</a>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Team</a>
                <a href="#">Partners</a>
                <a href="#">Careers</a>
              </div>
              <div className="link-group">
                <h4>Contact</h4>
                <a href="#">Support</a>
                <a href="#">Sales</a>
                <a href="#">Demo Request</a>
                <a href="#">Media Inquiries</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-info">
              <p>© 2025 Letsema - NUL MACS Project. All rights reserved.</p>
            </div>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
