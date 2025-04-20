import React from "react";
import "./LoanApplicationForm.css";
import { User, Handshake, AlertCircle, FileText } from "lucide-react";

const LoanApplicationForm = ({
  userData,
  loanAmount,
  setLoanAmount,
  selectedTerm,
  setSelectedTerm,
  calculateMonthlyPayment,
  interestRates,
}) => {
  // Safety check for interestRates prop
  const rates = interestRates || { 6: 12.5, 12: 14.0, 18: 15.5, 24: 17.0 };

  // Safe calculation function with error handling
  const safeCalculateMonthlyPayment = () => {
    try {
      // Ensure input values are valid numbers
      const amount = Number(loanAmount);
      const term = Number(selectedTerm);

      if (isNaN(amount) || amount <= 0 || isNaN(term) || term <= 0) {
        return 0;
      }

      // Use a safe approach to calculate if the provided function fails
      if (typeof calculateMonthlyPayment === "function") {
        return calculateMonthlyPayment();
      } else {
        // Fallback calculation if the function wasn't provided
        const rate = (rates[term] || 12.5) / 100 / 12;
        return (amount * rate) / (1 - Math.pow(1 + rate, -term));
      }
    } catch (error) {
      console.error("Error calculating monthly payment:", error);
      return 0;
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
    <div className="loan-application-form">
      <section className="form-section">
        <h3>
          <User size={18} /> Personal Information
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Legal Name</label>
            <input type="text" value={userData?.name || ""} readOnly />
          </div>
          <div className="form-group">
            <label>National ID Number</label>
            <input type="text" pattern="[0-9]{10}" required />
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input type="tel" pattern="[0-9]{10}" required />
          </div>
        </div>
      </section>

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
            <label>Interest Rate</label>
            <div className="rate-display">
              <span>{getCurrentRate().toFixed(1)}%</span>
              <small>Annual Percentage Rate (APR)</small>
            </div>
          </div>

          <div className="form-group">
            <label>Loan Purpose</label>
            <select required>
              <option value="">Select Purpose</option>
              <option>Agriculture</option>
              <option>Small Business</option>
              <option>Education</option>
              <option>Home Improvement</option>
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
          <input type="checkbox" required id="terms" />
          <label htmlFor="terms">
            I agree to the <a href="#terms">Terms & Conditions</a>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <input type="checkbox" required id="privacy" />
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

      <button type="submit" className="submit-application">
        <FileText size={18} />
        Submit Application
      </button>
    </div>
  );
};

export default LoanApplicationForm;
