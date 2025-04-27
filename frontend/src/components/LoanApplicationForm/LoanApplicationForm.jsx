import React, { useState, useEffect } from "react";
import "./LoanApplicationForm.css";
import { Handshake, AlertCircle, FileText } from "lucide-react";
import apiClient from "../../utils/apiClient";
import { getCurrentUser } from "../../utils/authUtils";

const LoanApplicationForm = ({
  loanAmount,
  setLoanAmount,
  selectedTerm,
  setSelectedTerm,
  calculateMonthlyPayment,
  interestRates,
}) => {
  const [loanPurpose, setLoanPurpose] = useState("");
  const [selectedMfi, setSelectedMfi] = useState(null);
  const [mfis, setMfis] = useState([]);
  const [loadingMfis, setLoadingMfis] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch active MFIs
  useEffect(() => {
    const fetchActiveMfis = async () => {
      try {
        setLoadingMfis(true);
        const data = await apiClient.get("mfi/?is_active=true");
        setMfis(data);
        if (data.length > 0) {
          setSelectedMfi(data[0].id); // Set first MFI as default
        }
      } catch (err) {
        setError("Failed to load MFIs. Please try again.");
        console.error("Error fetching MFIs:", err);
      } finally {
        setLoadingMfis(false);
      }
    };

    fetchActiveMfis();
  }, []);

  // Safety check for interestRates prop
  const rates = interestRates || { 6: 12.5, 12: 14.0, 18: 15.5, 24: 17.0 };

  // Safe calculation function with error handling
  const safeCalculateMonthlyPayment = () => {
    try {
      const amount = Number(loanAmount);
      const term = Number(selectedTerm);

      if (isNaN(amount) || amount <= 0 || isNaN(term) || term <= 0) {
        return 0;
      }

      if (typeof calculateMonthlyPayment === "function") {
        return calculateMonthlyPayment();
      } else {
        const rate = (rates[term] || 12.5) / 100 / 12;
        return (amount * rate) / (1 - Math.pow(1 + rate, -term));
      }
    } catch (error) {
      console.error("Error calculating monthly payment:", error);
      return 0;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate form
    if (
      !loanAmount ||
      !selectedTerm ||
      !loanPurpose ||
      !selectedMfi ||
      !agreeTerms ||
      !agreePrivacy
    ) {
      setError("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error("User not found. Please login again.");
      }

      const response = await apiClient.post("loans/", {
        amount: loanAmount,
        term_months: selectedTerm,
        purpose: loanPurpose,
        interest_rate: getCurrentRate(),
        mfi: selectedMfi,
        borrower: user.id,
      });

      setSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setLoanAmount(5000);
        setSelectedTerm(6);
        setLoanPurpose("");
        setAgreeTerms(false);
        setAgreePrivacy(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error submitting loan application:", err);
      setError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safely calculate total values
  const monthlyPayment = safeCalculateMonthlyPayment();
  const totalPayment = monthlyPayment * selectedTerm;
  const totalInterest = totalPayment - Number(loanAmount);

  // Get the current interest rate safely
  const getCurrentRate = () => {
    return rates[selectedTerm] !== undefined ? rates[selectedTerm] : 0;
  };

  return (
    <form className="loan-application-form" onSubmit={handleSubmit}>
      <section className="form-section">
        <h3>
          <Handshake size={18} /> Loan Particulars
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Loan Amount (M)</label>
            <div className="amount-range">
              <input
                type="number"
                min="1000"
                max="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                required
              />
              <div className="range-labels">
                <span>1,000</span>
                <span>50,000</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Repayment Period</label>
            <div className="period-selector">
              {[6, 12, 18, 24].map((months) => (
                <button
                  key={months}
                  type="button"
                  className={selectedTerm === months ? "active" : ""}
                  onClick={() => setSelectedTerm(months)}
                >
                  {months} Months
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Microfinance Institution</label>
            {loadingMfis ? (
              <div className="loading-message">Loading MFIs...</div>
            ) : (
              <select
                value={selectedMfi || ""}
                onChange={(e) => setSelectedMfi(Number(e.target.value))}
                required
              >
                {mfis.map((mfi) => (
                  <option key={mfi.id} value={mfi.id}>
                    {mfi.name} - {mfi.location}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Interest Rate</label>
            <div className="rate-display">
              <span>{getCurrentRate().toFixed(1)}%</span>
              <small>Annual Percentage Rate (APR)</small>
            </div>
          </div>

          <div className="form-group">
            <label>Loan Purpose</label>
            <select
              required
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
            >
              <option value="">Select Purpose</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Small Business">Small Business</option>
              <option value="Education">Education</option>
              <option value="Home Improvement">Home Improvement</option>
            </select>
          </div>
        </div>
      </section>

      <div className="repayment-summary">
        <h4>
          <AlertCircle size={18} /> Repayment Estimate
        </h4>
        <div className="repayment-grid">
          <div>
            <span>Monthly Payment:</span>
            <strong>
              M
              {isNaN(monthlyPayment)
                ? "0.00"
                : monthlyPayment.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
            </strong>
          </div>
          <div>
            <span>Total Interest:</span>
            <strong>
              M
              {isNaN(totalInterest)
                ? "0.00"
                : totalInterest.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
            </strong>
          </div>
          <div>
            <span>Total Repayment:</span>
            <strong>
              M
              {isNaN(totalPayment)
                ? "0.00"
                : totalPayment.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
            </strong>
          </div>
        </div>
      </div>

      <section className="form-section compliance-section">
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            required
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <label htmlFor="terms">
            I agree to the <a href="#terms">Terms & Conditions</a>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            required
            id="privacy"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
          />
          <label htmlFor="privacy">
            I consent to credit checks per <a href="#privacy">Privacy Policy</a>
          </label>
        </div>

        <div className="signature-field">
          <label>E-Signature</label>
          <div className="signature-pad">
            <p>Click to sign digitally</p>
          </div>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Application submitted successfully!
        </div>
      )}

      <button
        type="submit"
        className="submit-application"
        disabled={isSubmitting || loadingMfis}
      >
        <FileText size={18} />
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
};

export default LoanApplicationForm;
